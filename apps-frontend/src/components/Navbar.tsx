/**
 * Faraway LMS — Navbar Component
 *
 * Responsive navigation bar with auth state, role-based links,
 * glassmorphism styling, and mobile hamburger menu.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/utils/formatters";

export default function Navbar() {
  const { user, profile, isAuthenticated, isInstructor, signOut, loading } =
    useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/courses", label: "Courses", icon: BookOpen },
    ...(isAuthenticated
      ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
      : []),
    ...(isInstructor
      ? [
          {
            href: "/dashboard/instructor",
            label: "Instructor",
            icon: GraduationCap,
          },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="gradient-text">Faraway</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-navy-400 hover:bg-navy-800 hover:text-navy-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-20 shimmer rounded-lg" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-400">
                    {profile
                      ? getInitials(profile.full_name || user?.email || "U")
                      : "…"}
                  </div>
                  <span className="text-sm text-navy-300">
                    {profile?.full_name || user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-navy-400 transition-all hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-navy-300 transition-all hover:bg-navy-800 hover:text-navy-100"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="gradient-btn rounded-lg px-4 py-2 text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-navy-400 hover:bg-navy-800 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="animate-slide-up border-t border-navy-700/50 p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-indigo-500/15 text-indigo-400"
                      : "text-navy-400 hover:bg-navy-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            <hr className="my-2 border-navy-700/50" />

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <User className="h-4 w-4 text-navy-500" />
                  <span className="text-sm text-navy-300">
                    {profile?.full_name || user?.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-300 hover:bg-navy-800"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="gradient-btn mt-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
