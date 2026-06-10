"""
Faraway LMS — Database Client

Initialises and exposes Supabase client instances.
"""

from __future__ import annotations

from functools import lru_cache

from supabase import Client, create_client

from src.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    """
    Return a cached Supabase client using the **service role key**.

    The service role key bypasses RLS — use this only in the backend
    for administrative operations. For user-scoped queries, pass the
    user's JWT to the client headers.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_user_scoped_client(access_token: str) -> Client:
    """
    Create a Supabase client that impersonates a specific user via their
    JWT. This ensures RLS policies are enforced server-side.
    """
    settings = get_settings()
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.auth.set_session(access_token, "")  # type: ignore[arg-type]
    client.postgrest.auth(access_token)
    return client
