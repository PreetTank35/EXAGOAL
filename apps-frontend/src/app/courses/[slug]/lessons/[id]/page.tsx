/**
 * Faraway LMS — Lesson Viewer Page
 *
 * Full lesson content with markdown rendering, sidebar navigation,
 * and progress marking.
 */

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useCourse } from "@/hooks/useCourses";
import { useCourseProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";
import { api, type Lesson } from "@/services/api";
import LessonSidebar from "@/components/LessonSidebar";
import { showToast } from "@/components/ui";
import { formatDuration } from "@/utils/formatters";
import Link from "next/link";

export default function LessonViewerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const lessonId = params.id as string;
  const { course, loading: courseLoading } = useCourse(slug);
  const { isAuthenticated } = useAuth();
  const {
    completed: completedSet,
    isCompleted,
    markComplete,
    completionPercent,
  } = useCourseProgress(course?.id ?? null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const lessons = course?.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  useEffect(() => {
    if (!course?.id || !lessonId) return;
    setLessonLoading(true);
    api
      .getLesson(course.id, lessonId)
      .then(setLesson)
      .catch(() => setLesson(null))
      .finally(() => setLessonLoading(false));
  }, [course?.id, lessonId]);

  const handleMarkComplete = async () => {
    if (!lesson || !course) return;
    setMarking(true);
    try {
      await markComplete(lesson.id);
      showToast("Lesson completed! 🎉", "success");
    } catch {
      showToast("Failed to mark as complete", "error");
    } finally {
      setMarking(false);
    }
  };

  if (courseLoading || lessonLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-navy-300">Lesson not found</h2>
        <Link
          href={`/courses/${slug}`}
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Back to course
        </Link>
      </div>
    );
  }

  const done = isCompleted(lesson.id);
  const progress = completionPercent(lessons.length);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <LessonSidebar
            courseSlug={slug}
            courseId={course.id}
            lessons={lessons}
            activeLessonId={lessonId}
            completedLessonIds={completedSet}
            totalProgress={progress}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Top navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href={`/courses/${slug}`}
              className="flex items-center gap-2 text-sm text-navy-500 hover:text-indigo-400 lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to course
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden text-xs text-navy-500 hover:text-navy-300 lg:block"
            >
              {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            </button>

            {lesson.duration_minutes > 0 && (
              <span className="flex items-center gap-1 text-xs text-navy-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(lesson.duration_minutes)}
              </span>
            )}
          </div>

          {/* Lesson Title */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-indigo-400">
              Lesson {currentIndex + 1} of {lessons.length}
            </p>
            <h1 className="text-3xl font-bold text-navy-100">{lesson.title}</h1>
          </div>

          {/* Markdown Content */}
          <article className="markdown-body">
            <ReactMarkdown>{lesson.content_md}</ReactMarkdown>
          </article>

          {/* Completion Action */}
          {isAuthenticated && (
            <div className="mt-12 border-t border-navy-800/50 pt-8">
              {done ? (
                <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-300">
                      Lesson Completed
                    </p>
                    <p className="text-sm text-emerald-400/70">
                      Great work! Move on to the next lesson.
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="gradient-btn flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white disabled:opacity-50"
                  id="mark-complete-btn"
                >
                  {marking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Mark as Complete
                </button>
              )}
            </div>
          )}

          {/* Prev / Next Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {prevLesson ? (
              <Link
                href={`/courses/${slug}/lessons/${prevLesson.id}`}
                className="glass-card flex items-center gap-3 px-5 py-4 text-sm transition-all hover:border-indigo-500/30"
              >
                <ChevronLeft className="h-4 w-4 text-navy-500" />
                <div className="text-left">
                  <p className="text-xs text-navy-600">Previous</p>
                  <p className="font-medium text-navy-300">{prevLesson.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/courses/${slug}/lessons/${nextLesson.id}`}
                className="glass-card flex items-center gap-3 px-5 py-4 text-sm transition-all hover:border-indigo-500/30"
              >
                <div className="text-right">
                  <p className="text-xs text-navy-600">Next</p>
                  <p className="font-medium text-navy-300">{nextLesson.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-navy-500" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
