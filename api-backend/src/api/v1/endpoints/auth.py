"""
Faraway LMS — Auth Endpoints

Profile retrieval and updates for the currently authenticated user.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from src.core.database import get_supabase_client
from src.core.security import get_current_user
from src.models.schemas import ProfileResponse, ProfileUpdate, UserContext

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Return the authenticated user's profile."""
    db = get_supabase_client()

    result = db.table("profiles").select("*").eq("id", user.id).single().execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Account may not be fully provisioned.",
        )

    return ProfileResponse(**result.data)


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: ProfileUpdate,
    user: Annotated[UserContext, Depends(get_current_user)],
):
    """Update the authenticated user's own profile fields."""
    db = get_supabase_client()

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        db.table("profiles")
        .update(update_data)
        .eq("id", user.id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return ProfileResponse(**result.data[0])
