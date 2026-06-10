/**
 * Faraway LMS — Landing Page
 *
 * Hero section with animated gradient, featured courses preview,
 * feature highlights, and CTA section.
 */

"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  BarChart3,
  Shield,
  Sparkles,
  Zap,
  Users,
  Globe,
} from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import CourseCard from "@/components/CourseCard";
import { CourseCardSkeleton } from "@/components/ui";

export default function HomePage() {
  const { courses, loading } = useCourses({ limit: 3 });

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Start learning today — no credit card required
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl" style={{ animationDelay: "0.1s" }}>
              Learn{" "}
              <span className="gradient-text">Without Limits</span>
              <br />
              Grow Without Boundaries
            </h1>

            {/* Subheading */}
            <p className="animate-fade-in mt-6 max-w-2xl text-lg leading-relaxed text-navy-400 sm:text-xl" style={{ animationDelay: "0.2s" }}>
              Access expert-crafted courses in engineering, data science, and
              more. Track your progress, earn completions, and build real-world
              skills at your own pace.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in mt-8 flex flex-wrap gap-4" style={{ animationDelay: "0.3s" }}>
              <Link
                href="/courses"
                className="gradient-btn inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white"
                id="hero-browse-courses"
              >
                Browse Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-900/50 px-6 py-3 text-base font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800/50"
                id="hero-get-started"
              >
                Create Free Account
              </Link>
            </div>

            {/* Social proof */}
            <div className="animate-fade-in mt-10 flex items-center gap-6 text-sm text-navy-500" style={{ animationDelay: "0.4s" }}>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-400" />
                10,000+ learners
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                200+ courses
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-indigo-400" />
                50+ countries
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <section className="border-t border-navy-800/30 bg-navy-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy-100 sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">succeed</span>
            </h2>
            <p className="mt-3 text-lg text-navy-500">
              A complete learning platform built for modern learners.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Expert Content",
                desc: "Courses created by industry professionals with years of hands-on experience.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Track Progress",
                desc: "Visual dashboards showing your learning journey, completion rates, and streaks.",
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Secure & Private",
                desc: "Enterprise-grade security with row-level data protection and encrypted auth.",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Lightning Fast",
                desc: "Built on edge infrastructure for instant page loads and real-time sync.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card group p-6 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 transition-all group-hover:bg-indigo-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-navy-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-navy-100">
                Featured Courses
              </h2>
              <p className="mt-2 text-navy-500">
                Start with our most popular courses
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300 sm:flex"
            >
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [...Array(3)].map((_, i) => <CourseCardSkeleton key={i} />)
              : courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>

          {!loading && courses.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-navy-500">
                Courses will appear here once instructors publish them.
              </p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400"
            >
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────── */}
      <section className="border-t border-navy-800/30 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="glass-card p-10 sm:p-14">
            <GraduationCap className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-6 text-3xl font-bold text-navy-100 sm:text-4xl">
              Ready to start your{" "}
              <span className="gradient-text">learning journey</span>?
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Join thousands of learners building real-world skills. Create your
              free account and start learning today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="gradient-btn inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
                id="cta-register"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-navy-700 px-8 py-3.5 text-base font-semibold text-navy-300 transition-all hover:border-navy-600 hover:bg-navy-800/50"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
