'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiUsers, HiClipboardDocumentList, HiBookOpen, HiChartBar } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

export default function TeacherOverviewPage() {
  const [stats, setStats] = useState({ syllabi: 0, exams: 0 });
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: syllabiCount } = await supabase
        .from('syllabi')
        .select('*', { count: 'exact', head: true })
        .eq('instructor_id', user.id);

      const { count: examsCount } = await supabase
        .from('exams')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      setStats({
        syllabi: syllabiCount || 0,
        exams: examsCount || 0,
      });
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Overview</h1>
          <p className="text-zinc-400 mt-1">Manage your classes, syllabi, and exams.</p>
        </div>
        <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm font-medium">
          Instructor Mode
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: '—', icon: HiUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active Syllabi', value: String(stats.syllabi), icon: HiBookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'AI Generated Exams', value: String(stats.exams), icon: HiClipboardDocumentList, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Average Score', value: '—', icon: HiChartBar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <span className="text-3xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">1. Upload a Syllabus</p>
                <p className="text-xs text-zinc-400 mt-1">Upload your curriculum document (PDF, Word, or image) to get started.</p>
              </div>
              <Link href="/dashboard/teacher/syllabus" className="text-xs text-rose-400 font-medium hover:text-rose-300">Go →</Link>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">2. Generate an Exam with AI</p>
                <p className="text-xs text-zinc-400 mt-1">Use Google Gemma to auto-generate questions from your syllabus.</p>
              </div>
              <Link href="/dashboard/teacher/exams/generate" className="text-xs text-rose-400 font-medium hover:text-rose-300">Go →</Link>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">3. Publish & Monitor</p>
                <p className="text-xs text-zinc-400 mt-1">Published exams instantly appear on students' dashboards.</p>
              </div>
              <Link href="/dashboard/teacher/exams" className="text-xs text-rose-400 font-medium hover:text-rose-300">Go →</Link>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/teacher/exams/generate" className="block w-full text-left px-4 py-3 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-sm font-medium transition-colors">
              + Generate New Exam with AI
            </Link>
            <Link href="/dashboard/teacher/syllabus" className="block w-full text-left px-4 py-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700/50 text-sm font-medium transition-colors">
              Upload New Syllabus
            </Link>
            <Link href="/dashboard/teacher/exams" className="block w-full text-left px-4 py-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 hover:bg-zinc-700/50 text-sm font-medium transition-colors">
              View All Exams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
