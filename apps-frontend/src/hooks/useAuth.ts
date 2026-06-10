/**
 * Faraway LMS — Auth Hook
 *
 * Manages authentication state via Supabase and exposes sign-in,
 * sign-up, and sign-out functions.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/services/supabase";
import { api, type Profile } from "@/services/api";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = getSupabaseBrowserClient();

  // Fetch profile from our backend
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await api.getProfile();
      setState((prev) => ({ ...prev, profile }));
    } catch {
      // Profile may not exist yet during registration
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));

      if (session?.user) {
        await fetchProfile();
      } else {
        setState((prev) => ({ ...prev, profile: null }));
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));
      if (session?.user) fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return false;
      }
      return true;
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, role: string = "student") => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });
      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
        return false;
      }
      return true;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      profile: null,
      loading: false,
      error: null,
    });
  }, [supabase]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    clearError,
    isAuthenticated: !!state.session,
    isInstructor: state.profile?.role === "instructor" || state.profile?.role === "admin",
    isAdmin: state.profile?.role === "admin",
  };
}
