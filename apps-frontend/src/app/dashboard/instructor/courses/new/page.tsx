/**
 * Faraway LMS — Create Course Page
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Save,
  Globe,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/services/api";
import { showToast } from "@/components/ui";
import { slugify } from "@/utils/formatters";

export default function CreateCoursePage() {
  const router = useRouter();
  const { isInstructor } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState("draft");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      showToast("Please enter a course title", "error");
      return;
    }
    setSubmitting(true);
    try {
      const course = await api.createCourse({
        title,
        slug,
        description,
        difficulty,
        category,
        status,
      });
      showToast("Course created successfully!", "success");
      router.push(`/dashboard/instructor/courses/${course.id}/edit`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "Failed to create course";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isInstructor) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-navy-500">Instructor access required</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/instructor"
          className="mb-4 flex items-center gap-2 text-sm text-navy-500 hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-navy-100">Create New Course</h1>
        <p className="mt-1 text-navy-500">
          Set up your course details. You can add lessons after creating the course.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-200">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Course Details
          </h2>

          {/* Title */}
          <div>
            <label htmlFor="course-title" className="mb-1.5 block text-sm font-medium text-navy-300">
              Title *
            </label>
            <input
              type="text"
              id="course-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              placeholder="e.g., Full-Stack Web Development Masterclass"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="course-slug" className="mb-1.5 block text-sm font-medium text-navy-300">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-600">/courses/</span>
              <input
                type="text"
                id="course-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                className="flex-1 rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                placeholder="fullstack-web-dev"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="course-desc" className="mb-1.5 block text-sm font-medium text-navy-300">
              Description
            </label>
            <textarea
              id="course-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none"
              placeholder="Describe what students will learn in this course..."
            />
          </div>

          {/* Difficulty + Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="course-difficulty" className="mb-1.5 block text-sm font-medium text-navy-300">
                Difficulty
              </label>
              <select
                id="course-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 outline-none transition-all focus:border-indigo-500/50"
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">⚡ Intermediate</option>
                <option value="advanced">🔥 Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="course-category" className="mb-1.5 block text-sm font-medium text-navy-300">
                Category
              </label>
              <input
                type="text"
                id="course-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 px-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                placeholder="e.g., engineering, data-science"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-300">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                  status === "draft"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-navy-700/50 bg-navy-900/30 text-navy-400 hover:border-navy-600"
                }`}
              >
                <FileText className="h-4 w-4" />
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                  status === "published"
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-navy-700/50 bg-navy-900/30 text-navy-400 hover:border-navy-600"
                }`}
              >
                <Globe className="h-4 w-4" />
                Published
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/instructor"
            className="rounded-xl border border-navy-700 px-5 py-2.5 text-sm text-navy-400 transition-all hover:border-navy-600 hover:bg-navy-800/50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="gradient-btn flex items-center gap-2 rounded-xl px-6 py-2.5 font-medium text-white disabled:opacity-50"
            id="save-course-btn"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
}
