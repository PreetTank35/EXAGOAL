/**
 * Faraway LMS — Edit Course Page
 *
 * Edit course details and manage lessons (create, edit, delete, reorder).
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Globe,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  api,
  ApiError,
  type Course,
  type Lesson,
  type LessonCreatePayload,
} from "@/services/api";
import { showToast } from "@/components/ui";
import { formatDuration, slugify } from "@/utils/formatters";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isInstructor } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Course form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState("draft");

  // New lesson modal
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [newLesson, setNewLesson] = useState<LessonCreatePayload>({
    title: "",
    content_md: "",
    duration_minutes: 10,
  });
  const [addingLesson, setAddingLesson] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    // We need to fetch by ID — but our API uses slugs for GET.
    // Use the list endpoint and filter.
    api
      .listCourses({ limit: 100 })
      .then((result) => {
        const found = result.courses.find((c) => c.id === courseId);
        if (found) {
          setCourse(found);
          setTitle(found.title);
          setSlug(found.slug);
          setDescription(found.description);
          setDifficulty(found.difficulty);
          setCategory(found.category);
          setStatus(found.status);

          // Fetch lessons
          return api.listLessons(found.id);
        }
        return [];
      })
      .then((lessonList) => {
        if (lessonList) setLessons(lessonList);
      })
      .catch(() => {
        showToast("Failed to load course", "error");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const updated = await api.updateCourse(courseId, {
        title,
        slug,
        description,
        difficulty,
        category,
        status,
      });
      setCourse(updated);
      showToast("Course updated!", "success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Update failed";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) return;
    setAddingLesson(true);
    try {
      const lesson = await api.createLesson(courseId, newLesson);
      setLessons((prev) => [...prev, lesson]);
      setNewLesson({ title: "", content_md: "", duration_minutes: 10 });
      setShowNewLesson(false);
      showToast("Lesson added!", "success");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Failed to add lesson";
      showToast(msg, "error");
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await api.deleteLesson(courseId, lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      showToast("Lesson deleted", "info");
    } catch {
      showToast("Failed to delete lesson", "error");
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to archive this course?")) return;
    try {
      await api.deleteCourse(courseId);
      showToast("Course archived", "info");
      router.push("/dashboard/instructor");
    } catch {
      showToast("Failed to archive course", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!course || !isInstructor) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <p className="text-navy-500">Course not found or access denied</p>
        <Link
          href="/dashboard/instructor"
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/instructor"
          className="mb-4 flex items-center gap-2 text-sm text-navy-500 hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy-100">Edit Course</h1>
          <button
            onClick={handleDeleteCourse}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Archive
          </button>
        </div>
      </div>

      {/* Course Details Card */}
      <div className="glass-card mb-8 p-6 space-y-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-200">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Course Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-navy-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-navy-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-300">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 outline-none focus:border-indigo-500/50"
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">⚡ Intermediate</option>
              <option value="advanced">🔥 Advanced</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-300">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-navy-300">Status</label>
            <div className="flex gap-3">
              {[
                { value: "draft", icon: FileText, label: "Draft", color: "amber" },
                { value: "published", icon: Globe, label: "Published", color: "emerald" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                    status === opt.value
                      ? `border-${opt.color}-500/50 bg-${opt.color}-500/10 text-${opt.color}-300`
                      : "border-navy-700/50 text-navy-400 hover:border-navy-600"
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="gradient-btn flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-200">
            <FileText className="h-5 w-5 text-indigo-400" />
            Lessons ({lessons.length})
          </h2>
          <button
            onClick={() => setShowNewLesson(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Lesson
          </button>
        </div>

        {/* Lesson List */}
        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 rounded-xl border border-navy-700/30 bg-navy-900/30 px-4 py-3 transition-all hover:border-navy-600/50"
              >
                <GripVertical className="h-4 w-4 flex-shrink-0 text-navy-700 cursor-grab" />
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs text-navy-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-200">{lesson.title}</p>
                  <p className="text-xs text-navy-600">
                    {formatDuration(lesson.duration_minutes)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="flex-shrink-0 rounded p-1 text-navy-600 hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-navy-600">
            No lessons yet. Click &quot;Add Lesson&quot; to get started.
          </p>
        )}

        {/* New Lesson Modal */}
        {showNewLesson && (
          <div className="mt-4 animate-scale-in rounded-xl border border-indigo-500/20 bg-navy-900/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-navy-200">New Lesson</h3>
              <button onClick={() => setShowNewLesson(false)} className="text-navy-500 hover:text-navy-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newLesson.title}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Lesson title"
                className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none focus:border-indigo-500/50"
              />
              <textarea
                value={newLesson.content_md}
                onChange={(e) => setNewLesson((prev) => ({ ...prev, content_md: e.target.value }))}
                placeholder="Lesson content (Markdown supported)"
                rows={6}
                className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none focus:border-indigo-500/50 resize-none font-mono"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-navy-500">Duration (min)</label>
                  <input
                    type="number"
                    min={1}
                    value={newLesson.duration_minutes}
                    onChange={(e) =>
                      setNewLesson((prev) => ({
                        ...prev,
                        duration_minutes: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-20 rounded-lg border border-navy-700/50 bg-navy-900/50 py-1.5 px-3 text-sm text-navy-200 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="flex-1" />
                <button
                  onClick={handleAddLesson}
                  disabled={addingLesson || !newLesson.title.trim()}
                  className="gradient-btn flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {addingLesson ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
