/**
 * Faraway LMS — Progress Hook
 *
 * Tracks lesson completion state and dashboard summary.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  api,
  type Progress,
  type ProgressSummary,
  ApiError,
} from "@/services/api";

export function useCourseProgress(courseId: string | null) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    api
      .getCourseProgress(courseId)
      .then((items) => {
        setCompleted(new Set(items.map((p) => p.lesson_id)));
      })
      .catch(() => {
        // Not enrolled or not authenticated
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const markComplete = useCallback(
    async (lessonId: string) => {
      if (!courseId) return;
      try {
        await api.markComplete(lessonId, courseId);
        setCompleted((prev) => new Set([...prev, lessonId]));
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : "Failed to mark complete";
        console.error(msg);
        throw err;
      }
    },
    [courseId]
  );

  const isCompleted = useCallback(
    (lessonId: string) => completed.has(lessonId),
    [completed]
  );

  const completionPercent = useCallback(
    (totalLessons: number) => {
      if (totalLessons === 0) return 0;
      return Math.round((completed.size / totalLessons) * 100);
    },
    [completed]
  );

  return { completed, loading, markComplete, isCompleted, completionPercent };
}

export function useProgressSummary() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProgressSummary()
      .then(setSummary)
      .catch(() => {
        // Not authenticated
      })
      .finally(() => setLoading(false));
  }, []);

  return { summary, loading };
}
