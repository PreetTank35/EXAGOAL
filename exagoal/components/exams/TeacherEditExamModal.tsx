'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiPencilSquare } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

export interface ExamEditData {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  available_until?: string;
  status?: string;
  exam_type?: string;
}

interface TeacherEditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamEditData | null;
  onSave: (updatedExam: ExamEditData) => void;
}

export default function TeacherEditExamModal({ isOpen, onClose, exam, onSave }: TeacherEditExamModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [availableUntil, setAvailableUntil] = useState('');
  const [status, setStatus] = useState('draft');
  const [examType, setExamType] = useState('knowledge');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (exam && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(exam.title);
      setDescription(exam.description || '');
      setDurationMinutes(exam.duration_minutes);
      setStatus(exam.status || 'draft');
      setExamType(exam.exam_type || 'knowledge');
      
      // Convert to format required by datetime-local (YYYY-MM-DDThh:mm)
      try {
        const d = new Date(exam.scheduled_at);
        const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        setScheduledAt(localDate.toISOString().slice(0, 16));
      } catch {
        setScheduledAt('');
      }

      try {
        if (exam.available_until) {
          const d = new Date(exam.available_until);
          const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
          setAvailableUntil(localDate.toISOString().slice(0, 16));
        } else {
          setAvailableUntil('');
        }
      } catch {
        setAvailableUntil('');
      }
    }
  }, [exam, isOpen]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!exam) return;
    
    setLoading(true);
    setError('');

    try {
      // Convert back to UTC for DB
      const utcScheduled = new Date(scheduledAt).toISOString();
      const utcAvailableUntil = availableUntil ? new Date(availableUntil).toISOString() : null;

      // Validate: available_until must be after scheduled_at
      if (utcAvailableUntil && new Date(utcAvailableUntil) <= new Date(utcScheduled)) {
        setError('Available until must be after the scheduled start time.');
        setLoading(false);
        return;
      }

      const updates: Record<string, unknown> = {
        title,
        description,
        scheduled_at: utcScheduled,
        duration_minutes: durationMinutes,
        status,
        exam_type: examType,
        updated_at: new Date().toISOString()
      };

      if (utcAvailableUntil) {
        updates.available_until = utcAvailableUntil;
      }

      const { error: updateError } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', exam.id);

      if (updateError) throw new Error(updateError.message);

      onSave({
        ...exam,
        title,
        description,
        scheduled_at: utcScheduled,
        duration_minutes: durationMinutes,
        available_until: utcAvailableUntil || undefined,
        status,
        exam_type: examType,
      });
      
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update exam');
      } else {
        setError(String(err) || 'Failed to update exam');
      }
    } finally {
      setLoading(false);
    }
  }

  // Check if exam has already started (active/completed)
  const isLive = exam?.status === 'active' || exam?.status === 'completed';

  if (!isOpen || !exam) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <HiPencilSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Edit Exam</h2>
                <p className="text-sm text-zinc-400">Modify exam details before it starts.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {isLive && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                ⚠️ This exam is currently <strong>{exam.status}</strong>. Some fields like scheduled time cannot be changed.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field w-full min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="input-field w-full"
                  disabled={isLive}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  {isLive && <option value="active">Active (Live)</option>}
                  {exam.status === 'completed' && <option value="completed">Completed</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Exam Type</label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value)}
                  className="input-field w-full"
                  disabled={isLive}
                >
                  <option value="knowledge">Knowledge</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="ethical">Ethics</option>
                  <option value="collaborative">Collaboration</option>
                  <option value="wellness_check">Wellness Check</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Scheduled Start</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="input-field w-full"
                  required
                  disabled={isLive}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(parseInt(e.target.value))}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Available Until (Optional)</label>
              <input
                type="datetime-local"
                value={availableUntil}
                onChange={e => setAvailableUntil(e.target.value)}
                className="input-field w-full"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Students can start the exam any time between the scheduled start and this deadline.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl text-sm font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
