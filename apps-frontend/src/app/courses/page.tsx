/**
 * Faraway LMS — Course Catalog Page
 *
 * Searchable, filterable grid of all published courses.
 */

"use client";

import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/CourseCard";
import { SearchFilter, CourseCardSkeleton, EmptyState } from "@/components/ui";
import { BookOpen } from "lucide-react";

export default function CoursesPage() {
  const { courses, total, loading, filters, updateFilters } = useCourses();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-100 sm:text-4xl">
          Course Catalog
        </h1>
        <p className="mt-2 text-navy-500">
          {total > 0
            ? `${total} course${total !== 1 ? "s" : ""} available`
            : "Discover courses to start your learning journey"}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-8">
        <SearchFilter
          onSearch={(search) => updateFilters({ search })}
          onDifficultyChange={(difficulty) => updateFilters({ difficulty })}
          currentSearch={filters.search}
          currentDifficulty={filters.difficulty}
        />
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No courses found"
          description={
            filters.search || filters.difficulty
              ? "Try adjusting your search or filters."
              : "Courses will appear here once instructors publish them."
          }
        />
      )}
    </div>
  );
}
