"""
Faraway LMS — Enrollment Endpoints

Handles student enrollment and unenrollment from courses.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from src.core.database import get_supabase_client
from src.core.security import get_current_user
from src.models.schemas import EnrollmentResponse, UserContext

logger = logging.getLogger(__name__)
router = APIRouter(tags=["enrollments"])


@router.post(
    "/courses/{course_id}/enroll",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def enroll_in_course(
    course_id: str,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Enroll the current user in a course."""
    db = get_supabase_client()

    # Verify course exists and is published
    course = db.table("courses").select("id, status").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.data["status"] != "published":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course is not available for enrollment")

    # Check if already enrolled
    existing = (
        db.table("enrollments")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .execute()
    )

    if existing.data:
        enrollment = existing.data[0]
        if enrollment["status"] == "active":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled in this course")
        # Re-activate if previously dropped
        result = (
            db.table("enrollments")
            .update({"status": "active"})
            .eq("id", enrollment["id"])
            .execute()
        )
        return EnrollmentResponse(**result.data[0])

    # Create new enrollment
    result = (
        db.table("enrollments")
        .insert({"user_id": user.id, "course_id": course_id, "status": "active"})
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Enrollment failed")

    return EnrollmentResponse(**result.data[0])


@router.delete("/courses/{course_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
async def unenroll_from_course(
    course_id: str,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Unenroll (drop) the current user from a course."""
    db = get_supabase_client()

    result = (
        db.table("enrollments")
        .update({"status": "dropped"})
        .eq("user_id", user.id)
        .eq("course_id", course_id)
        .eq("status", "active")
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active enrollment not found")


@router.get("/enrollments/me", response_model=list[EnrollmentResponse])
async def get_my_enrollments(
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """List all active enrollments for the current user, including course data."""
    db = get_supabase_client()

    result = (
        db.table("enrollments")
        .select("*, courses(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("enrolled_at", desc=True)
        .execute()
    )

    enrollments = []
    for row in result.data or []:
        course_data = row.pop("courses", None)
        enrollment = EnrollmentResponse(**row)
        if course_data:
            from src.models.schemas import CourseResponse
            enrollment.course = CourseResponse(**course_data)
        enrollments.append(enrollment)

    return enrollments
