'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  HiClipboardDocumentList,
  HiArrowTrendingUp,
  HiShieldCheck,
  HiCpuChip,
  HiArrowRight,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiChartBar,
} from 'react-icons/hi2';

// Demo data for MVP
const STATS = [
  {
    label: 'Total Exams',
    value: '12',
    change: '+3 this month',
    icon: HiClipboardDocumentList,
    color: '#6366f1',
  },
  {
    label: 'Avg. Score',
    value: '78.5%',
    change: '+2.3% improvement',
    icon: HiArrowTrendingUp,
    color: '#22c55e',
  },
  {
    label: 'Credentials',
    value: '8',
    change: 'All verified on-chain',
    icon: HiShieldCheck,
    color: '#8b5cf6',
  },
  {
    label: 'AI Insights',
    value: '24',
    change: 'Personalized tips',
    icon: HiCpuChip,
    color: '#06b6d4',
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

export default function DashboardPage() {
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('exams')
        .select('id, title, exam_type, scheduled_at, duration_minutes, status, available_until')
        .in('status', ['published', 'active'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);
      if (data) setUpcomingExams(data);
    }
    load();

    // Real-time subscription
    const channel = supabase
      .channel('dashboard-exams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exams' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Welcome back, <span className="gradient-text">Student</span>
        </motion.h1>
        <p className="text-zinc-400 mt-1">
          Here&apos;s your assessment overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="glass-card p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            <div
              className="text-xs mt-2 font-medium"
              style={{ color: stat.color }}
            >
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upcoming Exams */}
        <motion.div
          className="lg:col-span-3 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Upcoming Exams</h2>
            <Link
              href="/dashboard/exams"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingExams.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-sm">
                No upcoming exams. They'll appear here once your teachers publish them.
              </div>
            ) : upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ background: getExamTypeColor(exam.exam_type) }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${getExamTypeColor(exam.exam_type)}15`,
                          color: getExamTypeColor(exam.exam_type),
                        }}
                      >
                        {getExamTypeLabel(exam.exam_type)}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <HiClock className="w-3 h-3" />
                        {exam.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">
                    {new Date(exam.scheduled_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(exam.scheduled_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Recent Results</h2>
            <Link
              href="/dashboard/results"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <HiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-6 text-center text-zinc-500 text-sm">
              Your exam results will appear here once you complete assessments.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <Link
          href="/dashboard/exams/create"
          className="glass-card glass-card-hover p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <HiClipboardDocumentList className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Create Exam</h3>
            <p className="text-xs text-zinc-500">Design a new assessment</p>
          </div>
        </Link>
        <Link
          href="/dashboard/profile"
          className="glass-card glass-card-hover p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <HiChartBar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">View Profile</h3>
            <p className="text-xs text-zinc-500">Chi-Toku-Tai dashboard</p>
          </div>
        </Link>
        <Link
          href="/dashboard/credentials"
          className="glass-card glass-card-hover p-5 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <HiShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">My Credentials</h3>
            <p className="text-xs text-zinc-500">Blockchain-verified certs</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
