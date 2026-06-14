'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiClock,
  HiMagnifyingGlass,
  HiClipboardDocumentList,
} from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { formatTo12Hour } from '@/lib/utils/timeFormat';
import AnimatedList from '@/components/ui/AnimatedList';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  exam_type: string;
  duration_minutes: number;
  scheduled_at: string;
  status: string;
  is_adaptive: boolean;
  available_until?: string;
  strict_submission?: boolean;
}

function getExamTypeColor(type: string) {
  const colors: Record<string, string> = {
    knowledge: '#6366f1',
    reasoning: '#3b82f6',
    ethical: '#8b5cf6',
    collaborative: '#ec4899',
    wellness_check: '#06b6d4',
  };
  return colors[type] || '#6366f1';
}

function getExamTypeLabel(type: string) {
  const labels: Record<string, string> = {
    knowledge: '知 Knowledge',
    reasoning: '知 Reasoning',
    ethical: '徳 Ethics',
    collaborative: '徳 Collaboration',
    wellness_check: '体 Wellness',
  };
  return labels[type] || type;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'published': return 'bg-green-500/10 text-green-400';
    case 'active': return 'bg-yellow-500/10 text-yellow-400';
    case 'completed': return 'bg-blue-500/10 text-blue-400';
    default: return 'bg-zinc-500/10 text-zinc-400';
  }
}

function ExamCountdown({ scheduledAt, availableUntil }: { scheduledAt: string; availableUntil?: string }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduled = new Date(scheduledAt);
  const diff = scheduled.getTime() - now.getTime();
  
  if (diff > 0) {
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return <span className="font-mono text-zinc-400">Starts in {h}h {m}m {s}s</span>;
  }
  
  if (availableUntil) {
    const end = new Date(availableUntil);
    if (now > end) {
      return <span className="text-red-400 font-semibold">Closed</span>;
    }
  }
  
  return <span className="text-emerald-400 font-semibold animate-pulse">Open Now</span>;
}

export default function ExamsPage() {
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadExams();

    // Subscribe to real-time changes on exams table (all relevant statuses)
    const channel = supabase
      .channel('student-exams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'exams',
      }, () => {
        loadExams(); // Reload when any exam changes
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadExams() {
    // Students see all published, active, and draft exams (upcoming ones)
    const { data } = await supabase
      .from('exams')
      .select('*')
      .in('status', ['draft', 'published', 'active'])
      .order('scheduled_at', { ascending: true });

    if (data) setExams(data);
    setLoading(false);
  }

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase()) ||
    (exam.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by status
  const now = new Date();
  const upcoming = filteredExams.filter(e => new Date(e.scheduled_at) > now);
  const inProgress = filteredExams.filter(e => {
    const start = new Date(e.scheduled_at);
    const end = e.available_until ? new Date(e.available_until) : new Date(start.getTime() + e.duration_minutes * 60000);
    return now >= start && now <= end;
  });
  const pastExams = filteredExams.filter(e => {
    const start = new Date(e.scheduled_at);
    const end = e.available_until ? new Date(e.available_until) : new Date(start.getTime() + e.duration_minutes * 60000);
    return now > end;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Examinations</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Your published exams appear here automatically
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-md">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="exam-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10"
            placeholder="Search exams..."
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-400">Loading exams...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiClipboardDocumentList className="w-10 h-10 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 font-medium mb-1">No exams available</p>
          <p className="text-sm text-zinc-500">Exams will appear here once your teachers publish them.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 mb-4">🔴 In Progress</h2>
              <AnimatedList
                items={inProgress}
                renderItem={(exam, idx) => <ExamCard exam={exam} idx={idx} />}
                displayScrollbar={false}
              />
            </div>
          )}

          {/* Upcoming */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4">📅 Upcoming Exams</h2>
            {upcoming.length > 0 ? (
              <AnimatedList
                items={upcoming}
                renderItem={(exam, idx) => <ExamCard exam={exam} idx={idx} />}
                displayScrollbar={false}
              />
            ) : (
              <div className="glass-card p-8 text-center">
                <HiClipboardDocumentList className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                <p className="text-zinc-400 font-medium text-sm">No upcoming exams scheduled</p>
                <p className="text-xs text-zinc-500 mt-1">New exams will appear here once your teachers create them.</p>
              </div>
            )}
          </div>

          {/* Past */}
          {pastExams.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">🕒 Past Exams</h2>
              <div className="opacity-75 grayscale-[0.5]">
                <AnimatedList
                  items={pastExams}
                  renderItem={(exam, idx) => <ExamCard exam={exam} idx={idx} />}
                  displayScrollbar={false}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam, idx }: { exam: Exam; idx: number }) {
  return (
    <motion.div
      className="glass-card glass-card-hover p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.08 }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            background: `${getExamTypeColor(exam.exam_type)}15`,
            color: getExamTypeColor(exam.exam_type),
          }}
        >
          {getExamTypeLabel(exam.exam_type)}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(exam.status)}`}>
          {exam.status}
        </span>
      </div>

      <h3 className="text-base font-semibold mb-2 leading-snug">
        {exam.title}
      </h3>
      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
        {exam.description || 'No description provided.'}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-4">
        <span className="flex items-center gap-1" title="Scheduled Start Time">
          <HiClock className="w-3.5 h-3.5" />
          {new Date(exam.scheduled_at).toLocaleDateString()} <span className="font-semibold text-zinc-300">{formatTo12Hour(exam.scheduled_at)}</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded-md">
          {exam.duration_minutes} min
        </span>
        {exam.is_adaptive && (
          <span className="text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-md">⚡ Adaptive</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500">
          <ExamCountdown scheduledAt={exam.scheduled_at} availableUntil={exam.available_until} />
        </span>
        {(() => {
            const now = new Date();
            const start = new Date(exam.scheduled_at);
            const end = exam.available_until ? new Date(exam.available_until) : new Date(start.getTime() + exam.duration_minutes * 60000);
            const isOpen = now >= start && now <= end;
            const isUpcoming = now < start;
            
            if (isOpen) {
              return (
                <Link
                  href={`/dashboard/exams/${exam.id}`}
                  className="text-xs font-medium px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  Start Exam →
                </Link>
              );
            }
            if (isUpcoming) {
              return (
                <Link
                  href={`/dashboard/exams/${exam.id}`}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View Details →
                </Link>
              );
            }
            return (
              <span className="text-xs font-medium text-zinc-600 cursor-not-allowed">
                Ended
              </span>
            );
        })()}
      </div>
    </motion.div>
  );
}
