'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiUserPlus, HiCheck, HiMagnifyingGlass } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

interface Student {
  id: string;
  full_name: string;
  enrolled: boolean;
}

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  examTitle: string;
}

export default function EnrollmentModal({ isOpen, onClose, examId, examTitle }: EnrollmentModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const supabase = createClient();

  const fetchStudents = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError('');

    try {
      // Fetch all students
      const { data: allStudents, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')
        .order('full_name', { ascending: true });

      if (studentsError) throw new Error(studentsError.message);

      // Fetch currently enrolled students for this exam
      const res = await fetch(`/api/exams/${examId}/enroll`);
      const enrollData = await res.json();
      const enrolledIds = new Set(
        (enrollData.students || []).map((s: Student) => s.id)
      );

      setStudents(
        (allStudents || []).map((s: { id: string; full_name: string }) => ({
          ...s,
          enrolled: enrolledIds.has(s.id),
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [examId, supabase]);

  useEffect(() => {
    if (isOpen && examId) {
      fetchStudents();
    }
  }, [isOpen, examId, fetchStudents]);

  const toggleStudent = (studentId: string) => {
    setStudents(prev =>
      prev.map((s: Student) => (s.id === studentId ? { ...s, enrolled: !s.enrolled } : s))
    );
  };

  const selectAll = () => {
    setStudents(prev => prev.map((s: Student) => ({ ...s, enrolled: true })));
  };

  const deselectAll = () => {
    setStudents(prev => prev.map((s: Student) => ({ ...s, enrolled: false })));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const enrolledIds = students.filter((s: Student) => s.enrolled).map((s: Student) => s.id);
      const unenrolledIds = students.filter((s: Student) => !s.enrolled).map((s: Student) => s.id);

      // Enroll selected students
      if (enrolledIds.length > 0) {
        const res = await fetch(`/api/exams/${examId}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_ids: enrolledIds }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to enroll students');
        }
      }

      // Unenroll deselected students
      if (unenrolledIds.length > 0) {
        const res = await fetch(`/api/exams/${examId}/enroll`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_ids: unenrolledIds }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to unenroll students');
        }
      }

      setSuccessMsg(`${enrolledIds.length} student(s) enrolled successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter((s: Student) =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enrolledCount = students.filter((s: Student) => s.enrolled).length;

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <HiUserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Enroll Students</h2>
                <p className="text-sm text-zinc-400 truncate max-w-sm">{examTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Controls */}
          <div className="p-4 border-b border-zinc-800/50 space-y-3">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {enrolledCount} of {students.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {successMsg}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-zinc-500">
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-3" />
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <p className="font-medium mb-1">No students found</p>
                <p className="text-sm">
                  {searchQuery ? 'Try a different search term.' : 'No students are registered yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left ${
                      student.enrolled
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <span className={`text-sm font-medium ${student.enrolled ? 'text-white' : 'text-zinc-400'}`}>
                      {student.full_name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        student.enrolled
                          ? 'bg-blue-500 text-white'
                          : 'border border-zinc-600'
                      }`}
                    >
                      {student.enrolled && <HiCheck className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HiUserPlus className="w-4 h-4" />
                  Save Enrollments
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
