/**
 * Faraway LMS — Course Detail Page
 *
 * Course overview with instructor info, lesson list, enrollment,
 * and progress tracking.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Users,
  CheckCircle2,
  Circle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCourse } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/services/api";
import { DifficultyBadge, ProgressRing, showToast } from "@/components/ui";
import { formatDate, formatDuration, totalDuration } from "@/utils/formatters";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { course, loading, error } = useCourse(slug);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { completed, isCompleted, completionPercent, loading: progressLoading } =
    useCourseProgress(course?.id ?? null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Check enrollment status
  useEffect(() => {
    if (!course?.id || !isAuthenticated) return;
    api
      .getMyEnrollments()
      .then((enrollments) => {
        const isEnrolled = enrollments.some(
          (e) => e.course_id === course.id && e.status === "active"
        );
        setEnrolled(isEnrolled);
      })
      .catch(() => {});
  }, [course?.id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!course) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setEnrolling(true);
    try {
      await api.enroll(course.id);
      setEnrolled(true);
      showToast("Successfully enrolled!", "success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Enrollment failed";
      showToast(msg, "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <BookOpen className="mb-4 h-12 w-12 text-navy-600" />
        <h2 className="text-xl font-semibold text-navy-300">Course not found</h2>
        <p className="mt-2 text-navy-500">{error || "This course may have been removed."}</p>
        <Link
          href="/courses"
          className="gradient-btn mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
        >
          Browse courses
        </Link>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const totalMins = totalDuration(lessons);
  const progress = completionPercent(lessons.length);

  return (
    <div>
      {/* Hero Banner */}
      <section className="gradient-hero border-b border-navy-800/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {/* Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <DifficultyBadge difficulty={course.difficulty} size="md" />
                {course.category !== "general" && (
                  <span className="rounded-full bg-navy-800/50 px-3 py-1 text-xs text-navy-400">
                    {course.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-navy-400">
                {course.description}
              </p>

              {/* Meta */}
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-navy-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {lessons.length} lessons
                </span>
                {totalMins > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatDuration(totalMins)} total
                  </span>
                )}
                {course.enrolled_count != null && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {course.enrolled_count} enrolled
                  </span>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-400">
                    {course.instructor.full_name?.[0] || "I"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-200">
                      {course.instructor.full_name}
                    </p>
                    <p className="text-xs text-navy-500">Instructor</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6">
                {enrolled && (
                  <div className="mb-6 flex items-center justify-center">
                    <ProgressRing percent={progress} size={80} strokeWidth={5} />
                  </div>
                )}

                <button
                  onClick={enrolled && lessons.length > 0 ? () => router.push(`/courses/${slug}/lessons/${lessons[0].id}`) : handleEnroll}
                  disabled={enrolling}
                  className="gradient-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white disabled:opacity-50"
                  id="enroll-btn"
                >
                  {enrolling ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : enrolled ? (
                    <>
                      {progress > 0 ? "Continue Learning" : "Start Learning"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-5 w-5" />
                      Enroll for Free
                    </>
                  )}
                </button>

                {enrolled && (
                  <p className="mt-3 text-center text-xs text-navy-500">
                    {completed.size} of {lessons.length} lessons completed
                  </p>
                )}

                <div className="mt-5 space-y-3 border-t border-navy-700/30 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                    This course includes
                  </p>
                  <ul className="space-y-2 text-sm text-navy-400">
                    <li className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      {lessons.length} structured lessons
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      {formatDuration(totalMins)} of content
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                      Progress tracking
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson List */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-navy-100">
            Course Content
          </h2>

          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const done = isCompleted(lesson.id);
              return (
                <div
                  key={lesson.id}
                  className={`glass-card flex items-center gap-4 px-5 py-4 ${
                    enrolled ? "cursor-pointer" : ""
                  }`}
                  onClick={() =>
                    enrolled &&
                    router.push(`/courses/${slug}/lessons/${lesson.id}`)
                  }
                  id={`lesson-item-${lesson.id}`}
                >
                  {/* Number / Check */}
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-navy-600 text-xs text-navy-500">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-medium ${
                        done ? "text-navy-400" : "text-navy-200"
                      }`}
                    >
                      {lesson.title}
                    </h3>
                  </div>

                  {/* Duration */}
                  {lesson.duration_minutes > 0 && (
                    <span className="flex items-center gap-1 text-xs text-navy-600">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(lesson.duration_minutes)}
                    </span>
                  )}

                  {enrolled && (
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-navy-600" />
                  )}
                </div>
              );
            })}
          </div>

          {lessons.length === 0 && (
            <div className="glass-card p-10 text-center">
              <Circle className="mx-auto mb-3 h-8 w-8 text-navy-600" />
              <p className="text-navy-500">
                Lessons are being prepared. Check back soon!
              </p>
            </div>
          )}

          {/* Updated Date */}
          <p className="mt-6 text-xs text-navy-600">
            Last updated {formatDate(course.updated_at)}
          </p>
        </div>
      </section>
    </div>
  );
}
