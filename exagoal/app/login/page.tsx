'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiArrowRight, HiPhone, HiBuildingLibrary } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>('email');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      let authError = null;

      if (method === 'email') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authError = signInError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          phone,
          password,
        });
        authError = signInError;
      }

      if (authError) {
        throw new Error(authError.message);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failed');

      // 1. Verify actual role in the Database (Truth Check)
      const { data: teacherRecord } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', user.id)
        .single();

      const isActuallyInstructor = !!teacherRecord;

      // 2. Set HMAC-Signed Secure Cookie via server, then route correctly
      const actualRole = isActuallyInstructor ? 'instructor' : 'student';
      await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: actualRole }),
      });

      if (isActuallyInstructor) {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard');
      }

      router.refresh(); // Refresh to ensure middleware catches the new session cookie
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)',
            top: '20%',
            left: '10%',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)',
            bottom: '10%',
            right: '10%',
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Exa<span className="text-indigo-400">Goal</span>
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            Sign in to access your dashboard
          </p>

          {/* Role Toggle */}
          <div className="flex bg-zinc-800/50 rounded-xl p-1 mb-4 border border-zinc-700/50">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                role === 'student' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HiAcademicCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                role === 'instructor' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HiBuildingLibrary className="w-4 h-4" /> Instructor
            </button>
          </div>

          {/* Login Method Toggle */}
          <div className="flex bg-zinc-800/50 rounded-xl p-1 mb-6 border border-zinc-700/50">
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                method === 'email' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HiEnvelope className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                method === 'phone' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HiPhone className="w-4 h-4" /> Phone
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {method === 'email' ? (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="you@institution.edu"
                    required={method === 'email'}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="login-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field !pl-10"
                    placeholder="+1234567890"
                    required={method === 'phone'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
