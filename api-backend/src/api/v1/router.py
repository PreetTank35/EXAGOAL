"""
Faraway LMS — API v1 Router

Aggregates all endpoint routers under the /api/v1 prefix.
"""

from fastapi import APIRouter

from src.api.v1.endpoints import auth, courses, enrollments, lessons, progress

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(courses.router)
router.include_router(lessons.router)
router.include_router(enrollments.router)
router.include_router(progress.router)
