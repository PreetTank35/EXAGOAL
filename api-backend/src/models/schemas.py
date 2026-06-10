"""
Faraway LMS — Pydantic Schemas

Request / response models used across the API surface. All models use
``model_config`` with ``from_attributes = True`` so they can be hydrated
directly from Supabase dict responses.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Auth / User Context ──────────────────────────────────────

class UserContext(BaseModel):
    """Extracted from the decoded JWT — carried through request lifecycle."""

    id: str
    email: str
    role: str = "student"


# ── Profiles ─────────────────────────────────────────────────

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    avatar_url: str = ""
    role: str
    bio: str = ""
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


# ── Courses ──────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    slug: str = Field(..., min_length=3, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: str = ""
    thumbnail_url: str = ""
    difficulty: str = Field(default="beginner", pattern=r"^(beginner|intermediate|advanced)$")
    status: str = Field(default="draft", pattern=r"^(draft|published|archived)$")
    category: str = "general"


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    slug: Optional[str] = Field(default=None, min_length=3, max_length=200, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty: Optional[str] = Field(default=None, pattern=r"^(beginner|intermediate|advanced)$")
    status: Optional[str] = Field(default=None, pattern=r"^(draft|published|archived)$")
    category: Optional[str] = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    instructor_id: str
    title: str
    slug: str
    description: str
    thumbnail_url: str = ""
    difficulty: str
    status: str
    category: str
    created_at: datetime
    updated_at: datetime

    # Optionally populated
    instructor: Optional[ProfileResponse] = None
    lessons: Optional[list[LessonResponse]] = None
    lesson_count: Optional[int] = None
    enrolled_count: Optional[int] = None


class CourseListResponse(BaseModel):
    courses: list[CourseResponse]
    total: int


# ── Lessons ──────────────────────────────────────────────────

class LessonCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    content_md: str = ""
    order_index: int = 0
    duration_minutes: int = 0


class LessonUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=300)
    content_md: Optional[str] = None
    order_index: Optional[int] = None
    duration_minutes: Optional[int] = None


class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    title: str
    content_md: str = ""
    order_index: int
    duration_minutes: int = 0
    created_at: datetime
    updated_at: datetime


class LessonReorder(BaseModel):
    """List of lesson IDs in the desired order."""
    lesson_ids: list[str]


# ── Enrollments ──────────────────────────────────────────────

class EnrollmentCreate(BaseModel):
    course_id: str


class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    course_id: str
    status: str
    enrolled_at: datetime

    course: Optional[CourseResponse] = None


# ── Progress ─────────────────────────────────────────────────

class ProgressCreate(BaseModel):
    lesson_id: str
    course_id: str


class ProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    lesson_id: str
    course_id: str
    completed_at: datetime


class ProgressSummary(BaseModel):
    """Dashboard-level stats for the current user."""

    total_enrolled: int = 0
    total_completed_lessons: int = 0
    courses_in_progress: int = 0
    courses_completed: int = 0


# Forward reference resolution
CourseResponse.model_rebuild()
