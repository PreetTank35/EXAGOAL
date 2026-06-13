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

interface Exam {
  id: string;
  title: string;
  description: string | null;
  exam_type: string;
  duration_minutes: number;
  scheduled_at: string;
  status: string;
  is_adaptive: boolean;
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

function getTimeLabel(scheduledAt: string): string {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  const diff = scheduled.getTime() - now.getTime();

  if (diff < 0) return 'In Progress';
  if (diff < 3600000) return `Starts in ${Math.ceil(diff / 60000)} min`;
  if (diff < 86400000) return `Starts in ${Math.ceil(diff / 3600000)} hours`;
  return scheduled.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ExamsPage() {
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadExams();

    // Subscribe to real-time changes on exams table
    const channel = supabase
      .channel('published-exams')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'exams',
        filter: 'status=eq.published',
      }, () => {
        loadExams(); // Reload when any exam changes
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadExams() {
    // Students see all published exams
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .in('status', ['published', 'active'])
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
    const end = new Date(start.getTime() + e.duration_minutes * 60000);
    return now >= start && now <= end;
  });
  const pastExams = filteredExams.filter(e => {
    const start = new Date(e.scheduled_at);
    const end = new Date(start.getTime() + e.duration_minutes * 60000);
    return now > end;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Examinations</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Your published exams appear here automatically
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {inProgress.map((exam, idx) => (
                  <ExamCard key={exam.id} exam={exam} idx={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">📅 Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {upcoming.map((exam, idx) => (
                  <ExamCard key={exam.id} exam={exam} idx={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastExams.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">🕒 Past Exams</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 opacity-75 grayscale-[0.5]">
                {pastExams.map((exam, idx) => (
                  <ExamCard key={exam.id} exam={exam} idx={idx} />
                ))}
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
      className="glass-card glass-card-hover p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.08 }}
    >
      <div className="flex items-start justify-between mb-4">
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

      <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
        <span className="flex items-center gap-1">
          <HiClock className="w-3.5 h-3.5" />
          {exam.duration_minutes} min
        </span>
        {exam.is_adaptive && (
          <span className="text-cyan-400 font-medium">⚡ Adaptive</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <span className="text-xs text-zinc-500">
          {getTimeLabel(exam.scheduled_at)}
        </span>
        <Link
          href={`/dashboard/exams/${exam.id}`}
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}
