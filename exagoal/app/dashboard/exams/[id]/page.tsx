'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiClock, HiArrowRight, HiChevronLeft } from 'react-icons/hi2';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatTo12Hour } from '@/lib/utils/timeFormat';

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadExam();
  }, [id]);

  async function loadExam() {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setExam(data);
    setLoading(false);
  }

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the full 6-digit OTP code');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const res = await fetch(`/api/exams/${id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: otp, student_id: user.id })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to access exam');
      }
      
      router.push(`/exam/live/${data.session_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center p-12 text-zinc-400">Loading exam details...</div>;
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-rose-400 mb-4">Exam Not Found</h2>
        <p className="text-zinc-400 mb-6">This exam may have been deleted or is unavailable.</p>
        <Link href="/dashboard/exams" className="btn-secondary inline-flex items-center gap-2">
          <HiChevronLeft className="w-4 h-4" /> Back to Exams
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/exams" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
        <HiChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <motion.div
        className="glass-card p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
          <HiShieldCheck className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
        <p className="text-zinc-400 mb-6">{exam.description || 'No description provided.'}</p>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300 mb-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <span className="flex items-center gap-1.5 font-medium">
            <HiClock className="w-4 h-4 text-indigo-400" />
            Scheduled for {new Date(exam.scheduled_at).toLocaleDateString()} at {formatTo12Hour(exam.scheduled_at)}
          </span>
          <span className="flex items-center gap-1.5 font-medium border-l border-zinc-700 pl-4">
            {exam.duration_minutes} Minutes
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium capitalize border-l border-zinc-700 ml-2 pl-4">
            {exam.exam_type}
          </span>
        </div>

        <form onSubmit={handleAccess} className="space-y-6 border-t border-zinc-800/50 pt-8">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3 text-center">
              Enter 6-Digit Access Code (OTP)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="e.g. A4X9B2"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700"
              maxLength={6}
            />
            <p className="text-xs text-zinc-500 mt-3 text-center">
              Your instructor will provide this code, or it will appear in your notifications.
            </p>
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || otp.length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Unlock Exam
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
