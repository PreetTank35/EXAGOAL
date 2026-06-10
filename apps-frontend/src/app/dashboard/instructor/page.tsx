/**
 * Faraway LMS — Instructor Dashboard
 *
 * Overview of instructor's courses and student statistics.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Loader2,
  Plus,
  Users,
  BarChart3,
  Eye,
  Edit,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api, type Course } from "@/services/api";
import { DifficultyBadge, StatsCard, EmptyState } from "@/components/ui";
import { formatDate } from "@/utils/formatters";

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { profile, isAuthenticated, isInstructor, loading: authLoading } =
    useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isInstructor)) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, isInstructor, router]);

  useEffect(() => {
    if (!isAuthenticated || !isInstructor) return;
    api
      .listCourses({ limit: 50 })
      .then((result) => {
        // Filter to only show instructor's own courses
        const myCourses = result.courses.filter(
          (c) => c.instructor_id === profile?.id
        );
        setCourses(myCourses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isInstructor, profile?.id]);

  if (authLoading || !isInstructor) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const publishedCount = courses.filter((c) => c.status === "published").length;
  const draftCount = courses.filter((c) => c.status === "draft").length;
  const totalLessons = courses.reduce(
    (sum, c) => sum + (c.lesson_count || 0),
    0
  );
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.enrolled_count || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-100">
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-navy-500">
            Manage your courses and track student engagement
          </p>
        </div>
        <Link
          href="/dashboard/instructor/courses/new"
          className="gradient-btn hidden items-center gap-2 rounded-xl px-5 py-2.5 font-medium text-white sm:inline-flex"
          id="create-course-btn"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<BookOpen className="h-5 w-5" />}
          value={publishedCount}
          label="Published Courses"
        />
        <StatsCard
          icon={<Edit className="h-5 w-5" />}
          value={draftCount}
          label="Draft Courses"
        />
        <StatsCard
          icon={<BarChart3 className="h-5 w-5" />}
          value={totalLessons}
          label="Total Lessons"
        />
        <StatsCard
          icon={<Users className="h-5 w-5" />}
          value={totalStudents}
          label="Total Students"
        />
      </div>

      {/* Mobile create button */}
      <Link
        href="/dashboard/instructor/courses/new"
        className="gradient-btn mb-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white sm:hidden"
      >
        <Plus className="h-4 w-4" />
        Create New Course
      </Link>

      {/* Courses Table */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-navy-100">My Courses</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card flex items-center gap-4 p-5">
                <div className="shimmer h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-5 w-1/3 rounded" />
                  <div className="shimmer h-4 w-1/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                {/* Thumbnail */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
                  <BookOpen className="h-6 w-6 text-indigo-400/60" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-navy-200">
                      {course.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        course.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : course.status === "draft"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-navy-700/50 text-navy-500"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-navy-500">
                    <DifficultyBadge difficulty={course.difficulty} />
                    <span>{course.lesson_count ?? 0} lessons</span>
                    <span>{course.enrolled_count ?? 0} students</span>
                    <span>Updated {formatDate(course.updated_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-navy-400 transition-all hover:bg-navy-800 hover:text-navy-200"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/instructor/courses/${course.id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs text-indigo-400 transition-all hover:bg-indigo-500/20"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="No courses yet"
            description="Create your first course and start sharing your knowledge!"
            action={{
              label: "Create Course",
              href: "/dashboard/instructor/courses/new",
            }}
          />
        )}
      </div>
    </div>
  );
}
