/**
 * Faraway LMS — CourseCard Component
 *
 * Displays a course summary with glassmorphism card, difficulty badge,
 * instructor info, and optional progress bar.
 */

import Link from "next/link";
import { BookOpen, Clock, Users } from "lucide-react";
import type { Course } from "@/services/api";
import { difficultyConfig, formatDuration, truncate } from "@/utils/formatters";

interface CourseCardProps {
  course: Course;
  progress?: number; // 0–100
  showInstructor?: boolean;
}

export default function CourseCard({
  course,
  progress,
  showInstructor = true,
}: CourseCardProps) {
  const diff = difficultyConfig[course.difficulty] || difficultyConfig.beginner;
  const totalMinutes = course.lessons?.reduce(
    (sum, l) => sum + l.duration_minutes,
    0
  ) ?? 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <article className="glass-card overflow-hidden" id={`course-${course.slug}`}>
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-indigo-500/40" />
            </div>
          )}

          {/* Difficulty Badge */}
          <span
            className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${diff.color}`}
          >
            {diff.icon} {diff.label}
          </span>

          {/* Category */}
          {course.category && course.category !== "general" && (
            <span className="absolute top-3 left-3 rounded-full bg-navy-900/70 px-2.5 py-0.5 text-xs text-navy-300 backdrop-blur-sm">
              {course.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-navy-100 transition-colors group-hover:text-indigo-400">
            {course.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-navy-400">
            {truncate(course.description, 120)}
          </p>

          {/* Meta Row */}
          <div className="mt-4 flex items-center gap-4 text-xs text-navy-500">
            {course.lesson_count != null && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.lesson_count} lessons
              </span>
            )}
            {totalMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(totalMinutes)}
              </span>
            )}
            {course.enrolled_count != null && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.enrolled_count} enrolled
              </span>
            )}
          </div>

          {/* Instructor */}
          {showInstructor && course.instructor && (
            <div className="mt-4 flex items-center gap-2 border-t border-navy-700/30 pt-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-400">
                {course.instructor.full_name?.[0] || "I"}
              </div>
              <span className="text-xs text-navy-400">
                {course.instructor.full_name}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {progress != null && progress >= 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-navy-500">Progress</span>
                <span className="font-medium text-indigo-400">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    animation: "progress-fill 1s ease-out",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
