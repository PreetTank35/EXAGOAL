"""
Faraway LMS — Progress Endpoints

Lesson completion tracking and dashboard summary statistics.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from src.core.database import get_supabase_client
from src.core.security import get_current_user
from src.models.schemas import (
    ProgressCreate,
    ProgressResponse,
    ProgressSummary,
    UserContext,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
async def mark_lesson_completed(
    payload: ProgressCreate,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Mark a lesson as completed for the current user."""
    db = get_supabase_client()

    # Verify enrollment
    enrollment = (
        db.table("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", payload.course_id)
        .eq("status", "active")
        .execute()
    )
    if not enrollment.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Must be enrolled in the course to track progress",
        )

    # Verify lesson belongs to course
    lesson = (
        db.table("lessons")
        .select("id")
        .eq("id", payload.lesson_id)
        .eq("course_id", payload.course_id)
        .execute()
    )
    if not lesson.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found in this course")

    # Check if already completed (idempotent)
    existing = (
        db.table("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", payload.lesson_id)
        .execute()
    )
    if existing.data:
        return ProgressResponse(**existing.data[0])

    # Create progress record
    result = (
        db.table("progress")
        .insert({
            "user_id": user.id,
            "lesson_id": payload.lesson_id,
            "course_id": payload.course_id,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record progress",
        )

    return ProgressResponse(**result.data[0])


@router.get("/course/{course_id}", response_model=list[ProgressResponse])
async def get_course_progress(
    course_id: str,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Get all completed lessons for a specific course."""
    db = get_supabase_client()

    result = (
        db.table("progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .order("completed_at")
        .execute()
    )

    return [ProgressResponse(**row) for row in (result.data or [])]


@router.get("/summary", response_model=ProgressSummary)
async def get_progress_summary(
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """
    Dashboard summary stats: total enrollments, completed lessons,
    courses in progress, and courses completed.
    """
    db = get_supabase_client()

    # Total active enrollments
    enrollments = (
        db.table("enrollments")
        .select("course_id", count="exact")
        .eq("user_id", user.id)
        .eq("status", "active")
        .execute()
    )
    total_enrolled = enrollments.count or 0

    # Total completed lessons
    progress = (
        db.table("progress")
        .select("course_id, lesson_id", count="exact")
        .eq("user_id", user.id)
        .execute()
    )
    total_completed_lessons = progress.count or 0

    # Compute courses in progress vs completed
    courses_completed = 0
    courses_in_progress = 0

    if enrollments.data:
        enrolled_course_ids = [e["course_id"] for e in enrollments.data]

        for cid in enrolled_course_ids:
            # Count total lessons in course
            total_lessons = (
                db.table("lessons")
                .select("id", count="exact")
                .eq("course_id", cid)
                .execute()
            )
            total = total_lessons.count or 0

            # Count completed lessons in course
            completed = (
                db.table("progress")
                .select("id", count="exact")
                .eq("user_id", user.id)
                .eq("course_id", cid)
                .execute()
            )
            done = completed.count or 0

            if total > 0 and done >= total:
                courses_completed += 1
            elif done > 0:
                courses_in_progress += 1

    return ProgressSummary(
        total_enrolled=total_enrolled,
        total_completed_lessons=total_completed_lessons,
        courses_in_progress=courses_in_progress,
        courses_completed=courses_completed,
    )
