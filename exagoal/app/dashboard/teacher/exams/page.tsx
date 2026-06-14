'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiClipboardDocumentList, HiSparkles, HiPencilSquare, HiTrash, HiEye, HiDocumentDuplicate, HiKey } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { formatTo12Hour } from '@/lib/utils/timeFormat';
import TeacherOtpModal from '@/components/exams/TeacherOtpModal';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  status: string;
  exam_type: string;
  duration_minutes: number;
  scheduled_at: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-zinc-500/10 border-zinc-500/20', text: 'text-zinc-400', label: 'Draft' },
  published: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: 'Published' },
  active: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Live Now' },
  completed: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Completed' },
};

export default function TeacherExamsPage() {
  const [filter, setFilter] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  
  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [selectedOtpExam, setSelectedOtpExam] = useState<{ id: string, title: string } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (data) setExams(data);
    setLoading(false);
  }

  async function handleDelete(examId: string) {
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    if (!error) {
      setExams(exams.filter(e => e.id !== examId));
    }
  }

  async function handlePublish(examId: string) {
    const { error } = await supabase
      .from('exams')
      .update({ status: 'published' })
      .eq('id', examId);

    if (!error) {
      setExams(exams.map(e => e.id === examId ? { ...e, status: 'published' } : e));
    }
  }

  const filteredExams = filter === 'all' ? exams : exams.filter(e => e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-sm text-zinc-400 mt-1">Create, manage, and track all your examinations.</p>
        </div>
        <Link
          href="/dashboard/teacher/exams/generate"
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <HiSparkles className="w-4 h-4" /> Generate with AI
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'draft', 'published', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600'
            }`}
          >
            {f === 'all' ? `All (${exams.length})` : `${f} (${exams.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Exam Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-rose-400 rounded-full animate-spin mx-auto mb-3" />
            Loading exams...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <HiClipboardDocumentList className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No exams yet</p>
            <p className="text-sm">Use AI to generate your first exam from an uploaded syllabus.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/30 border-b border-zinc-800/50">
              <tr>
                <th className="px-6 py-3 font-medium">Exam</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Scheduled</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredExams.map(exam => {
                const style = STATUS_STYLES[exam.status] || STATUS_STYLES.draft;
                return (
                  <tr key={exam.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                          <HiClipboardDocumentList className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-xs text-zinc-500">{exam.exam_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{exam.duration_minutes} min</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {new Date(exam.scheduled_at).toLocaleDateString()}{' '}
                      <span className="font-semibold text-zinc-300">
                        {formatTo12Hour(exam.scheduled_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {exam.status !== 'completed' && exam.status !== 'archived' && exam.status !== 'active' && (
                          <button
                            onClick={async () => {
                              const res = await fetch(`/api/exams/${exam.id}/launch`, { method: 'POST' });
                              if (res.ok) {
                                setExams(exams.map(e => e.id === exam.id ? { ...e, status: 'active' } : e));
                                alert('Exam launched! OTP notifications sent to students.');
                              } else {
                                const data = await res.json();
                                alert(`Error: ${data.error}`);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                          >
                            Launch Exam
                          </button>
                        )}
                        {exam.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(exam.id)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                          >
                            Publish
                          </button>
                        )}
                        {(exam.status === 'active' || exam.status === 'completed') && (
                          <button
                            onClick={() => {
                              setSelectedOtpExam({ id: exam.id, title: exam.title });
                              setIsOtpModalOpen(true);
                            }}
                            className="p-2 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
                            title="View OTPs"
                          >
                            <HiKey className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors" title="View">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <TeacherOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        examId={selectedOtpExam?.id || ''}
        examTitle={selectedOtpExam?.title || ''}
      />
    </div>
  );
}
