/**
 * Faraway LMS — Student Dashboard
 *
 * Overview of enrolled courses, progress stats, and learning activity.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProgressSummary } from "@/hooks/useProgress";
import { api, type Enrollment } from "@/services/api";
import CourseCard from "@/components/CourseCard";
import { StatsCard, DashboardSkeleton, EmptyState } from "@/components/ui";
import { getGreeting } from "@/utils/formatters";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isAuthenticated, loading: authLoading } = useAuth();
  const { summary, loading: summaryLoading } = useProgressSummary();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {})
      .finally(() => setEnrollmentsLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-100">
          {getGreeting()},{" "}
          <span className="gradient-text">
            {profile?.full_name?.split(" ")[0] || "Learner"}
          </span>
        </h1>
        <p className="mt-1 text-navy-500">
          Here&apos;s your learning progress overview
        </p>
      </div>

      {/* Stats Grid */}
      {summaryLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<BookOpen className="h-5 w-5" />}
            value={summary?.total_enrolled ?? 0}
            label="Enrolled Courses"
          />
          <StatsCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={summary?.total_completed_lessons ?? 0}
            label="Lessons Completed"
          />
          <StatsCard
            icon={<TrendingUp className="h-5 w-5" />}
            value={summary?.courses_in_progress ?? 0}
            label="In Progress"
          />
          <StatsCard
            icon={<Trophy className="h-5 w-5" />}
            value={summary?.courses_completed ?? 0}
            label="Courses Finished"
          />
        </div>
      )}

      {/* Enrolled Courses */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-100">My Courses</h2>
          <Link
            href="/courses"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Browse more →
          </Link>
        </div>

        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="shimmer h-44" />
                <div className="space-y-3 p-5">
                  <div className="shimmer h-5 w-3/4 rounded" />
                  <div className="shimmer h-4 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : enrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) =>
              enrollment.course ? (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showInstructor={false}
                />
              ) : null
            )}
          </div>
        ) : (
          <EmptyState
            icon={<GraduationCap className="h-8 w-8" />}
            title="No courses yet"
            description="You haven't enrolled in any courses. Browse our catalog to get started!"
            action={{ label: "Browse Courses", href: "/courses" }}
          />
        )}
      </div>
    </div>
  );
}
