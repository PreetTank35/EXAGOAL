'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiPlus,
  HiClock,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiEllipsisVertical,
} from 'react-icons/hi2';

const DEMO_EXAMS = [
  {
    id: '1',
    title: 'Advanced Mathematics — Calculus II',
    description: 'Covers integration techniques, series convergence, and multivariable calculus.',
    exam_type: 'knowledge',
    duration_minutes: 90,
    scheduled_at: '2026-06-14T10:00:00Z',
    status: 'published',
    is_adaptive: true,
    question_count: 25,
    anti_cheat_level: 'strict',
  },
  {
    id: '2',
    title: 'Ethical Reasoning — Case Studies',
    description: 'Analyze real-world ethical dilemmas across technology, medicine, and business.',
    exam_type: 'ethical',
    duration_minutes: 60,
    scheduled_at: '2026-06-15T14:00:00Z',
    status: 'published',
    is_adaptive: false,
    question_count: 10,
    anti_cheat_level: 'standard',
  },
  {
    id: '3',
    title: 'Collaborative Problem Solving',
    description: 'Team-based assessment evaluating communication, leadership, and peer review.',
    exam_type: 'collaborative',
    duration_minutes: 45,
    scheduled_at: '2026-06-17T09:00:00Z',
    status: 'draft',
    is_adaptive: false,
    question_count: 8,
    anti_cheat_level: 'minimal',
  },
  {
    id: '4',
    title: 'Physics — Quantum Mechanics',
    description: 'Wave functions, Schrödinger equation, quantum entanglement fundamentals.',
    exam_type: 'reasoning',
    duration_minutes: 120,
    scheduled_at: '2026-06-20T09:00:00Z',
    status: 'draft',
    is_adaptive: true,
    question_count: 30,
    anti_cheat_level: 'strict',
  },
  {
    id: '5',
    title: 'Wellness Self-Assessment Q2',
    description: 'Reflect on mental well-being, study habits, and work-life balance this quarter.',
    exam_type: 'wellness_check',
    duration_minutes: 15,
    scheduled_at: '2026-06-22T08:00:00Z',
    status: 'published',
    is_adaptive: false,
    question_count: 12,
    anti_cheat_level: 'minimal',
  },
];

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
    case 'published':
      return 'bg-green-500/10 text-green-400';
    case 'active':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'draft':
      return 'bg-zinc-500/10 text-zinc-400';
    case 'completed':
      return 'bg-blue-500/10 text-blue-400';
    default:
      return 'bg-zinc-500/10 text-zinc-400';
  }
}

export default function ExamsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredExams = DEMO_EXAMS.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || exam.status === filter || exam.exam_type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Examinations</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage and monitor all assessments
          </p>
        </div>
        <Link
          href="/dashboard/exams/create"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <HiPlus className="w-4 h-4" />
          Create Exam
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
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
        <div className="flex gap-2 flex-wrap">
          {['all', 'published', 'draft', 'knowledge', 'ethical', 'wellness_check'].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800'
                }`}
              >
                {f === 'all'
                  ? 'All'
                  : f === 'wellness_check'
                  ? '体 Wellness'
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Exam Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredExams.map((exam, idx) => (
          <motion.div
            key={exam.id}
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
              {exam.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
              <span className="flex items-center gap-1">
                <HiClock className="w-3.5 h-3.5" />
                {exam.duration_minutes} min
              </span>
              <span>{exam.question_count} questions</span>
              {exam.is_adaptive && (
                <span className="text-cyan-400 font-medium">⚡ Adaptive</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <span className="text-xs text-zinc-500">
                {new Date(exam.scheduled_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <Link
                href={`/dashboard/exams/${exam.id}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                View Details →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-zinc-400">No exams match your criteria.</p>
        </div>
      )}
    </div>
  );
}
