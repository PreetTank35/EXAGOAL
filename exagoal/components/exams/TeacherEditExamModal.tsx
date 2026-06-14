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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (exam && isOpen) {
      setTitle(exam.title);
      setDescription(exam.description || '');
      setDurationMinutes(exam.duration_minutes);
      
      // Convert to format required by datetime-local (YYYY-MM-DDThh:mm)
      try {
        const d = new Date(exam.scheduled_at);
        // We use local time for the input
        const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        setScheduledAt(localDate.toISOString().slice(0, 16));
      } catch (e) {
        setScheduledAt('');
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
      const utcDate = new Date(scheduledAt).toISOString();

      const updates = {
        title,
        description,
        scheduled_at: utcDate,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', exam.id);

      if (updateError) throw new Error(updateError.message);

      onSave({
        ...exam,
        ...updates
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update exam');
    } finally {
      setLoading(false);
    }
  }

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
          className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <HiPencilSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Edit Exam</h2>
                <p className="text-sm text-zinc-400">Modify exam details below.</p>
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
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="input-field w-full"
                  required
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
