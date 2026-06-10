/**
 * Faraway LMS — Courses Hook
 *
 * Data fetching and mutation for courses.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  api,
  type Course,
  type CourseFilters,
  type CourseCreatePayload,
  ApiError,
} from "@/services/api";

export function useCourses(initialFilters?: CourseFilters) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CourseFilters>(initialFilters || {});

  const fetchCourses = useCallback(async (f?: CourseFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.listCourses(f || filters);
      setCourses(result.courses);
      setTotal(result.total);
    } catch (err) {
      const message = err instanceof ApiError ? err.detail : "Failed to fetch courses";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const updateFilters = useCallback(
    (newFilters: Partial<CourseFilters>) => {
      const merged = { ...filters, ...newFilters, offset: 0 };
      setFilters(merged);
    },
    [filters]
  );

  const createCourse = useCallback(async (data: CourseCreatePayload) => {
    const course = await api.createCourse(data);
    setCourses((prev) => [course, ...prev]);
    return course;
  }, []);

  return {
    courses,
    total,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchCourses,
    createCourse,
  };
}

export function useCourse(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .getCourse(slug)
      .then(setCourse)
      .catch((err) => {
        setError(err instanceof ApiError ? err.detail : "Failed to fetch course");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return { course, loading, error, setCourse };
}
