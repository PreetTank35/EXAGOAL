/**
 * Faraway LMS — Shared UI Components
 *
 * Small, reusable components: ProgressRing, DifficultyBadge,
 * StatsCard, SearchFilter, LoadingSkeleton, EmptyState, Toast.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { difficultyConfig } from "@/utils/formatters";

/* ── Progress Ring ─────────────────────────────────────────── */

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 4,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-navy-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-navy-200">{percent}%</span>
    </div>
  );
}

/* ── Difficulty Badge ──────────────────────────────────────── */

interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced";
  size?: "sm" | "md";
}

export function DifficultyBadge({
  difficulty,
  size = "sm",
}: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${config.color} ${sizeClass}`}>
      {config.icon} {config.label}
    </span>
  );
}

/* ── Stats Card ────────────────────────────────────────────── */

interface StatsCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  trend?: string;
  className?: string;
}

export function StatsCard({
  icon,
  value,
  label,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400">{trend}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-navy-100">{value}</p>
        <p className="mt-0.5 text-sm text-navy-500">{label}</p>
      </div>
    </div>
  );
}

/* ── Search & Filter ───────────────────────────────────────── */

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  currentSearch?: string;
  currentDifficulty?: string;
}

export function SearchFilter({
  onSearch,
  onDifficultyChange,
  currentSearch = "",
  currentDifficulty = "",
}: SearchFilterProps) {
  const [query, setQuery] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 pl-10 pr-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            id="search-courses"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all ${
            showFilters
              ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
              : "border-navy-700/50 bg-navy-900/50 text-navy-400 hover:border-navy-600"
          }`}
          id="toggle-filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="animate-scale-in flex flex-wrap gap-2">
          {["", "beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level || "all"}
              onClick={() => onDifficultyChange(level)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                currentDifficulty === level
                  ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30"
                  : "bg-navy-800/50 text-navy-400 hover:bg-navy-700/50"
              }`}
              id={`filter-${level || "all"}`}
            >
              {level
                ? `${difficultyConfig[level as keyof typeof difficultyConfig].icon} ${difficultyConfig[level as keyof typeof difficultyConfig].label}`
                : "All Levels"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Loading Skeleton ──────────────────────────────────────── */

export function CourseCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="shimmer h-44" />
      <div className="space-y-3 p-5">
        <div className="shimmer h-5 w-3/4 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="shimmer h-3 w-16 rounded" />
          <div className="shimmer h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="shimmer mb-4 h-10 w-10 rounded-xl" />
            <div className="shimmer mb-2 h-7 w-16 rounded" />
            <div className="shimmer h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800/50 text-navy-500">
        {icon || <BookOpen className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-navy-300">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-navy-500">{description}</p>
      {action && (
        <a
          href={action.href}
          className="gradient-btn mt-4 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

/* ── Toast Notification ────────────────────────────────────── */

type ToastType = "success" | "error" | "info";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

let toastCallback: ((toast: ToastData) => void) | null = null;

export function showToast(message: string, type: ToastType = "success") {
  const id = Math.random().toString(36).slice(2);
  toastCallback?.({ id, message, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: ToastData) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  useEffect(() => {
    toastCallback = addToast;
    return () => {
      toastCallback = null;
    };
  }, [addToast]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <AlertCircle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-indigo-400" />,
  };

  const colors = {
    success: "border-emerald-500/30",
    error: "border-rose-500/30",
    info: "border-indigo-500/30",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass animate-slide-up flex items-center gap-3 rounded-xl border px-4 py-3 ${colors[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="text-sm text-navy-200">{toast.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="ml-2 text-navy-500 hover:text-navy-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
