/**
 * Faraway LMS — Lesson Sidebar Component
 *
 * Collapsible lesson list with completion checkmarks,
 * duration display, and active lesson highlighting.
 */

"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Clock, ChevronLeft } from "lucide-react";
import type { Lesson } from "@/services/api";
import { formatDuration } from "@/utils/formatters";

interface LessonSidebarProps {
  courseSlug: string;
  courseId: string;
  lessons: Lesson[];
  activeLessonId?: string;
  completedLessonIds: Set<string>;
  totalProgress: number;
}

export default function LessonSidebar({
  courseSlug,
  courseId,
  lessons,
  activeLessonId,
  completedLessonIds,
  totalProgress,
}: LessonSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-navy-800/50 bg-navy-950/80">
      {/* Header */}
      <div className="border-b border-navy-800/50 p-4">
        <Link
          href={`/courses/${courseSlug}`}
          className="mb-3 flex items-center gap-2 text-xs text-navy-500 transition-colors hover:text-indigo-400"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to course
        </Link>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-navy-500">Course Progress</span>
            <span className="font-medium text-indigo-400">{totalProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson List */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLessonId;
            const isCompleted = completedLessonIds.has(lesson.id);

            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                  className={`group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-navy-400 hover:bg-navy-800/50 hover:text-navy-200"
                  }`}
                  id={`lesson-nav-${lesson.id}`}
                >
                  {/* Completion icon */}
                  <span className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle
                        className={`h-4 w-4 ${
                          isActive ? "text-indigo-400" : "text-navy-600"
                        }`}
                      />
                    )}
                  </span>

                  {/* Lesson info */}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-navy-600">
                      {index + 1}.
                    </span>{" "}
                    <span
                      className={
                        isCompleted ? "text-navy-400 line-through" : ""
                      }
                    >
                      {lesson.title}
                    </span>
                    {lesson.duration_minutes > 0 && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-navy-600">
                        <Clock className="h-3 w-3" />
                        {formatDuration(lesson.duration_minutes)}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
