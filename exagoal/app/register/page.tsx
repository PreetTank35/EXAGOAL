'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiAcademicCap,
  HiEnvelope,
  HiLockClosed,
  HiUser,
  HiArrowRight,
  HiBuildingLibrary,
  HiPhone,
} from 'react-icons/hi2';
import type { UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const ROLES: { value: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Take exams and track your growth',
    icon: HiAcademicCap,
  },
  {
    value: 'instructor',
    label: 'Instructor',
    desc: 'Create exams and monitor students',
    icon: HiBuildingLibrary,
  },
];

type RegisterMethod = 'email' | 'phone';

export default function RegisterPage() {
  const router = useRouter();
  const [method, setMethod] = useState<RegisterMethod>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // Frontend email validation gate for instructors
      if (role === 'instructor' && method === 'email' && !email.endsWith('@exagoal.in')) {
        throw new Error('Instructor accounts require an @exagoal.in email address.');
      }

      const supabase = createClient();
      let authError = null;

      if (method === 'email') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role, department: role === 'instructor' ? department : undefined },
          },
        });
        authError = signUpError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          phone,
          password,
          options: {
            data: { full_name: fullName, role, department: role === 'instructor' ? department : undefined },
          },
        });
        authError = signUpError;
      }

      if (authError) {
        throw new Error(authError.message);
      }

      setSuccessMsg('Account created successfully! Please wait...');
      
      // Check the database to see what role was actually assigned (Truth Check)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Determine role from the email domain (the DB trigger may not have completed yet)
        const isActuallyInstructor = !!user.email && user.email.endsWith('@exagoal.in');

        // Set HMAC-Signed Secure Cookie via server
        const actualRole = isActuallyInstructor ? 'instructor' : 'student';
        await fetch('/api/auth/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: actualRole }),
        });

        if (isActuallyInstructor) {
          setSuccessMsg('Welcome, Instructor! Redirecting to your portal...');
          setTimeout(() => {
            router.push('/dashboard/teacher');
            router.refresh();
          }, 1500);
        } else {
          setSuccessMsg('Account created! Redirecting to your dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1500);
        }
      } else {
        // If user is null (e.g. Email Confirmations are forced ON)
        setSuccessMsg('Account created successfully! Please check your email or phone for a verification link/code.');
        setTimeout(() => {
          router.push('/login');
          router.refresh();
        }, 2500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)',
            top: '10%',
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
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            Join the future of intelligent assessment
          </p>

          {/* Registration Method Toggle */}
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
          
          {successMsg && (
            <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                    }`}
                  >
                    <r.icon
                      className={`w-5 h-5 mb-1.5 ${
                        role === r.value ? 'text-indigo-400' : 'text-zinc-500'
                      }`}
                    />
                    <div className="text-sm font-semibold">{r.label}</div>
                    <div className="text-xs text-zinc-500">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Department (Instructor only) */}
            {role === 'instructor' && (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Department
                </label>
                <select
                  id="register-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="input-field w-full"
                  required={role === 'instructor'}
                >
                  <option value="">Select your department</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Economics">Economics</option>
                  <option value="Political Science">Political Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="register-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {method === 'email' ? (
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    id="register-email"
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
                    id="register-phone"
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
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
