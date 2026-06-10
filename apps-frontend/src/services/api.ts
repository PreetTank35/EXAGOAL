/**
 * Faraway LMS — API Client
 *
 * Typed wrapper around fetch for communicating with the FastAPI backend.
 * Automatically attaches the Supabase JWT for authenticated requests.
 */

import { getSupabaseBrowserClient } from "./supabase";

// ── Types ────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: "student" | "instructor" | "admin";
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  category: string;
  created_at: string;
  updated_at: string;
  instructor?: Profile;
  lessons?: Lesson[];
  lesson_count?: number;
  enrolled_count?: number;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_md: string;
  order_index: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  course?: Course;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

export interface ProgressSummary {
  total_enrolled: number;
  total_completed_lessons: number;
  courses_in_progress: number;
  courses_completed: number;
}

export interface CourseFilters {
  search?: string;
  difficulty?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CourseCreatePayload {
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  difficulty: string;
  status?: string;
  category?: string;
}

export interface LessonCreatePayload {
  title: string;
  content_md: string;
  order_index?: number;
  duration_minutes?: number;
}

// ── API Error ────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// ── Client ───────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };
    }
  } catch {
    // Not authenticated — continue without token
  }
  return { "Content-Type": "application/json" };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Typed API Methods ────────────────────────────────────────

export const api = {
  // Auth
  getProfile: () => request<Profile>("/api/v1/me"),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>("/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Courses
  listCourses: (filters?: CourseFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.difficulty) params.set("difficulty", filters.difficulty);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));
    const qs = params.toString();
    return request<CourseListResponse>(`/api/v1/courses${qs ? `?${qs}` : ""}`);
  },
  getCourse: (slug: string) => request<Course>(`/api/v1/courses/${slug}`),
  createCourse: (data: CourseCreatePayload) =>
    request<Course>("/api/v1/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCourse: (id: string, data: Partial<CourseCreatePayload>) =>
    request<Course>(`/api/v1/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCourse: (id: string) =>
    request<void>(`/api/v1/courses/${id}`, { method: "DELETE" }),

  // Lessons
  listLessons: (courseId: string) =>
    request<Lesson[]>(`/api/v1/courses/${courseId}/lessons`),
  getLesson: (courseId: string, lessonId: string) =>
    request<Lesson>(`/api/v1/courses/${courseId}/lessons/${lessonId}`),
  createLesson: (courseId: string, data: LessonCreatePayload) =>
    request<Lesson>(`/api/v1/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLesson: (courseId: string, lessonId: string, data: Partial<LessonCreatePayload>) =>
    request<Lesson>(`/api/v1/courses/${courseId}/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteLesson: (courseId: string, lessonId: string) =>
    request<void>(`/api/v1/courses/${courseId}/lessons/${lessonId}`, {
      method: "DELETE",
    }),
  reorderLessons: (courseId: string, lessonIds: string[]) =>
    request<Lesson[]>(`/api/v1/courses/${courseId}/lessons/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ lesson_ids: lessonIds }),
    }),

  // Enrollments
  enroll: (courseId: string) =>
    request<Enrollment>(`/api/v1/courses/${courseId}/enroll`, {
      method: "POST",
    }),
  unenroll: (courseId: string) =>
    request<void>(`/api/v1/courses/${courseId}/enroll`, { method: "DELETE" }),
  getMyEnrollments: () => request<Enrollment[]>("/api/v1/enrollments/me"),

  // Progress
  markComplete: (lessonId: string, courseId: string) =>
    request<Progress>("/api/v1/progress", {
      method: "POST",
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    }),
  getCourseProgress: (courseId: string) =>
    request<Progress[]>(`/api/v1/progress/course/${courseId}`),
  getProgressSummary: () => request<ProgressSummary>("/api/v1/progress/summary"),
};
