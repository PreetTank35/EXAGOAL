"""
Faraway LMS — Lesson Endpoints

CRUD and reorder operations for lessons within a course.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from src.core.database import get_supabase_client
from src.core.security import get_current_user
from src.models.schemas import (
    LessonCreate,
    LessonReorder,
    LessonResponse,
    LessonUpdate,
    UserContext,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/courses/{course_id}/lessons", tags=["lessons"])


def _verify_course_ownership(course_id: str, user: UserContext) -> dict:
    """Verify the course exists and the user is the owner or admin."""
    db = get_supabase_client()
    course = db.table("courses").select("*").eq("id", course_id).single().execute()

    if not course.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if course.data["instructor_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage this course's lessons")

    return course.data


@router.get("", response_model=list[LessonResponse])
async def list_lessons(course_id: str):
    """List all lessons for a course, ordered by order_index."""
    db = get_supabase_client()

    result = (
        db.table("lessons")
        .select("*")
        .eq("course_id", course_id)
        .order("order_index")
        .execute()
    )

    return [LessonResponse(**row) for row in (result.data or [])]


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(course_id: str, lesson_id: str):
    """Get a single lesson with its full content."""
    db = get_supabase_client()

    result = (
        db.table("lessons")
        .select("*")
        .eq("id", lesson_id)
        .eq("course_id", course_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    return LessonResponse(**result.data)


@router.post("", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    course_id: str,
    payload: LessonCreate,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Create a new lesson in a course. Requires course ownership."""
    _verify_course_ownership(course_id, user)
    db = get_supabase_client()

    # Auto-assign order_index if 0 (append to end)
    if payload.order_index == 0:
        existing = (
            db.table("lessons")
            .select("order_index")
            .eq("course_id", course_id)
            .order("order_index", desc=True)
            .limit(1)
            .execute()
        )
        next_index = (existing.data[0]["order_index"] + 1) if existing.data else 0
    else:
        next_index = payload.order_index

    lesson_data = {**payload.model_dump(), "course_id": course_id, "order_index": next_index}
    result = db.table("lessons").insert(lesson_data).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create lesson")

    return LessonResponse(**result.data[0])


@router.patch("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    course_id: str,
    lesson_id: str,
    payload: LessonUpdate,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Update a lesson. Requires course ownership."""
    _verify_course_ownership(course_id, user)
    db = get_supabase_client()

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = (
        db.table("lessons")
        .update(update_data)
        .eq("id", lesson_id)
        .eq("course_id", course_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    return LessonResponse(**result.data[0])


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    course_id: str,
    lesson_id: str,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Delete a lesson. Requires course ownership."""
    _verify_course_ownership(course_id, user)
    db = get_supabase_client()

    result = (
        db.table("lessons")
        .delete()
        .eq("id", lesson_id)
        .eq("course_id", course_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")


@router.patch("/reorder", response_model=list[LessonResponse])
async def reorder_lessons(
    course_id: str,
    payload: LessonReorder,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """
    Reorder lessons within a course. Accepts an ordered list of lesson IDs.
    Each lesson's ``order_index`` is set to its position in the list.
    """
    _verify_course_ownership(course_id, user)
    db = get_supabase_client()

    updated = []
    for index, lesson_id in enumerate(payload.lesson_ids):
        result = (
            db.table("lessons")
            .update({"order_index": index})
            .eq("id", lesson_id)
            .eq("course_id", course_id)
            .execute()
        )
        if result.data:
            updated.append(LessonResponse(**result.data[0]))

    return sorted(updated, key=lambda x: x.order_index)
