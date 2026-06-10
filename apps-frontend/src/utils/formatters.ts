/**
 * Faraway LMS — Utility Functions
 *
 * Pure helper functions for formatting, slugification, and calculations.
 */

/**
 * Format a date string into a human-readable format.
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

/**
 * Format a duration in minutes to a readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Calculate total duration of a list of items with duration_minutes.
 */
export function totalDuration(items: { duration_minutes: number }[]): number {
  return items.reduce((sum, item) => sum + item.duration_minutes, 0);
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Difficulty level configuration.
 */
export const difficultyConfig = {
  beginner: {
    label: "Beginner",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: "🌱",
  },
  intermediate: {
    label: "Intermediate",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: "⚡",
  },
  advanced: {
    label: "Advanced",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    icon: "🔥",
  },
} as const;

/**
 * Truncate text to a max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Compute a greeting based on time of day.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Generate initials from a full name.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
