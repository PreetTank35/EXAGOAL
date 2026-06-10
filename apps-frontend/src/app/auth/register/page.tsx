/**
 * Faraway LMS — Registration Page
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, error, clearError, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    const ok = await signUp(email, password, fullName, role);
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="glass-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
              <Mail className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-navy-100">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-navy-400">
              We&apos;ve sent a confirmation link to <strong className="text-navy-200">{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
            >
              Go to login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-navy-100">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-navy-500">
              Start learning for free today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-navy-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-600" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 pl-10 pr-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-navy-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-600" />
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 pl-10 pr-4 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-navy-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-navy-700/50 bg-navy-900/50 py-2.5 pl-10 pr-10 text-sm text-navy-200 placeholder-navy-600 outline-none transition-all focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-600 hover:text-navy-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-300">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                    role === "student"
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-navy-700/50 bg-navy-900/30 text-navy-400 hover:border-navy-600"
                  }`}
                  id="role-student"
                >
                  <BookOpen className="h-4 w-4" />
                  Learn
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                    role === "instructor"
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-navy-700/50 bg-navy-900/30 text-navy-400 hover:border-navy-600"
                  }`}
                  id="role-instructor"
                >
                  <GraduationCap className="h-4 w-4" />
                  Teach
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="gradient-btn flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white disabled:opacity-50"
              id="sign-up-btn"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
