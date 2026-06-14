'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiClipboardDocumentList, HiClipboardDocumentCheck, HiKey } from 'react-icons/hi2';

interface OtpData {
  student_id: string;
  student_name: string;
  otp_code: string;
  expires_at: string;
  status: string;
}

interface TeacherOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  examTitle: string;
}

export default function TeacherOtpModal({ isOpen, onClose, examId, examTitle }: TeacherOtpModalProps) {
  const [otps, setOtps] = useState<OtpData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && examId) {
      fetchOtps();
    }
  }, [isOpen, examId]);

  async function fetchOtps() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/exams/${examId}/otps`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load OTPs');
      setOtps(data.otps || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const copyAll = async () => {
    const text = otps.map(o => `${o.student_name}: ${o.otp_code}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId('all');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

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
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <HiKey className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Examination OTPs</h2>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-zinc-500">
                <div className="w-6 h-6 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
                Loading access codes...
              </div>
            ) : otps.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                  <HiKey className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No OTPs Generated</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  Access codes haven't been generated for this exam yet. Once you launch the exam, the access codes will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={copyAll}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors flex items-center gap-2"
                  >
                    {copiedId === 'all' ? (
                      <><HiClipboardDocumentCheck className="w-4 h-4 text-emerald-400" /> Copied All!</>
                    ) : (
                      <><HiClipboardDocumentList className="w-4 h-4" /> Copy All</>
                    )}
                  </button>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Student Name</th>
                        <th className="px-4 py-3 font-medium">Access Code</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {otps.map(otp => (
                        <tr key={otp.student_id} className="hover:bg-zinc-800/20">
                          <td className="px-4 py-3 text-zinc-200 font-medium">
                            {otp.student_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono tracking-wider font-bold text-white bg-zinc-800 px-2 py-1 rounded">
                              {otp.otp_code}
                            </span>
                            {new Date(otp.expires_at) < new Date() && (
                              <span className="ml-2 text-xs text-red-400">(Expired)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => copyToClipboard(otp.otp_code, otp.student_id)}
                              className="p-1.5 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              title="Copy code"
                            >
                              {copiedId === otp.student_id ? (
                                <HiClipboardDocumentCheck className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <HiClipboardDocumentList className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
