"""
Faraway LMS — Security Module

JWT verification for Supabase-issued tokens and role-based access control.
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from src.core.config import Settings, get_settings
from src.models.schemas import UserContext

logger = logging.getLogger(__name__)

# Supabase JWTs use HS256 by default
_ALGORITHM = "HS256"

_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> UserContext:
    """
    Decode and validate a Supabase JWT from the Authorization header.

    Returns a ``UserContext`` with the user's id, email, and role.
    Raises 401 if the token is missing, expired, or malformed.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[_ALGORITHM],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id: str | None = payload.get("sub")
    email: str | None = payload.get("email")
    role: str = payload.get("user_metadata", {}).get("role", "student")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing subject",
        )

    return UserContext(id=user_id, email=email or "", role=role)


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> UserContext | None:
    """
    Like ``get_current_user`` but returns ``None`` instead of raising
    when no token is provided. Used for public endpoints that optionally
    personalize responses for authenticated users.
    """
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, settings)
    except HTTPException:
        return None


def require_role(*allowed_roles: str):
    """
    Dependency factory that restricts access to users whose role is in
    ``allowed_roles``.

    Usage::

        @router.post("/courses", dependencies=[Depends(require_role("instructor", "admin"))])
        async def create_course(...): ...
    """

    async def _check(user: Annotated[UserContext, Depends(get_current_user)]) -> UserContext:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' is not permitted. Required: {', '.join(allowed_roles)}",
            )
        return user

    return _check
