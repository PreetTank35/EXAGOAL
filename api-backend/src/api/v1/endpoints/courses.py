"""
Faraway LMS — Course Endpoints

CRUD operations for courses with RBAC enforcement.
"""

from __future__ import annotations

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.core.database import get_supabase_client
from src.core.security import get_current_user, get_optional_user, require_role
from src.models.schemas import (
    CourseCreate,
    CourseListResponse,
    CourseResponse,
    CourseUpdate,
    UserContext,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=CourseListResponse)
async def list_courses(
    user: Annotated[UserContext | None, Depends(get_optional_user)],
    search: Optional[str] = Query(None, max_length=200),
    difficulty: Optional[str] = Query(None, pattern=r"^(beginner|intermediate|advanced)$"),
    category: Optional[str] = Query(None, max_length=100),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    List published courses with optional filtering.
    Instructors also see their own drafts.
    """
    db = get_supabase_client()

    query = db.table("courses").select(
        "*, profiles!courses_instructor_id_fkey(id, full_name, avatar_url)",
        count="exact",
    )

    # Public users only see published; instructors also see own drafts
    if user and user.role in ("instructor", "admin"):
        query = query.or_(f"status.eq.published,instructor_id.eq.{user.id}")
    else:
        query = query.eq("status", "published")

    if search:
        query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")
    if difficulty:
        query = query.eq("difficulty", difficulty)
    if category:
        query = query.eq("category", category)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    result = query.execute()

    courses = []
    for row in result.data or []:
        instructor_data = row.pop("profiles", None)
        course = CourseResponse(**row)
        if instructor_data:
            from src.models.schemas import ProfileResponse
            course.instructor = ProfileResponse(
                **instructor_data,
                role="instructor",
                bio="",
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
        courses.append(course)

    return CourseListResponse(courses=courses, total=result.count or len(courses))


@router.get("/{slug}", response_model=CourseResponse)
async def get_course(
    slug: str,
    user: Annotated[UserContext | None, Depends(get_optional_user)],
):
    """Get a single course by slug, including its lessons."""
    db = get_supabase_client()

    result = (
        db.table("courses")
        .select(
            "*, profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio, role, created_at, updated_at), "
            "lessons(id, course_id, title, content_md, order_index, duration_minutes, created_at, updated_at)"
        )
        .eq("slug", slug)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    row = result.data

    # Block non-published access for non-owners
    if row["status"] != "published":
        if not user or (user.id != row["instructor_id"] and user.role != "admin"):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    instructor_data = row.pop("profiles", None)
    lessons_data = row.pop("lessons", [])

    course = CourseResponse(**row)

    if instructor_data:
        from src.models.schemas import ProfileResponse
        course.instructor = ProfileResponse(**instructor_data)

    if lessons_data:
        from src.models.schemas import LessonResponse
        course.lessons = sorted(
            [LessonResponse(**l) for l in lessons_data],
            key=lambda x: x.order_index,
        )
    else:
        course.lessons = []

    course.lesson_count = len(course.lessons)

    # Get enrollment count
    enroll_result = (
        db.table("enrollments")
        .select("id", count="exact")
        .eq("course_id", row["id"])
        .eq("status", "active")
        .execute()
    )
    course.enrolled_count = enroll_result.count or 0

    return course


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    payload: CourseCreate,
    user: Annotated[UserContext, Depends(require_role("instructor", "admin"))],
):
    """Create a new course. Restricted to instructors and admins."""
    db = get_supabase_client()

    # Check slug uniqueness
    existing = db.table("courses").select("id").eq("slug", payload.slug).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Slug '{payload.slug}' is already taken",
        )

    course_data = {**payload.model_dump(), "instructor_id": user.id}
    result = db.table("courses").insert(course_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create course",
        )

    return CourseResponse(**result.data[0])


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    payload: CourseUpdate,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Update a course. Only the owner or an admin may update."""
    db = get_supabase_client()

    # Verify ownership
    course = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if course.data["instructor_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    # Check slug uniqueness if changing slug
    if "slug" in update_data and update_data["slug"] != course.data["slug"]:
        existing = db.table("courses").select("id").eq("slug", update_data["slug"]).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Slug '{update_data['slug']}' is already taken",
            )

    result = db.table("courses").update(update_data).eq("id", course_id).execute()

    if not result.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Update failed")

    return CourseResponse(**result.data[0])


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Soft-delete (archive) a course. Only the owner or an admin may delete."""
    db = get_supabase_client()

    course = db.table("courses").select("*").eq("id", course_id).single().execute()
    if not course.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if course.data["instructor_id"] != user.id and user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Soft delete → archive
    db.table("courses").update({"status": "archived"}).eq("id", course_id).execute()
