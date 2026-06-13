'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiAcademicCap,
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiShieldCheck,
  HiExclamationTriangle,
  HiCheckCircle,
  HiPaperAirplane,
  HiLightBulb,
} from 'react-icons/hi2';
import { useExamLockdown } from '@/hooks/useExamLockdown';

// Demo exam questions
const DEMO_QUESTIONS = [
  {
    id: '1',
    question_text:
      'Evaluate the following integral: ∫(0 to π/2) sin²(x) cos(x) dx',
    question_type: 'short_answer' as const,
    max_marks: 10,
    difficulty_level: 3,
    bloom_taxonomy: 'apply',
    options: null,
  },
  {
    id: '2',
    question_text:
      'Which of the following series converges?',
    question_type: 'mcq' as const,
    max_marks: 5,
    difficulty_level: 2,
    bloom_taxonomy: 'analyze',
    options: [
      { id: 'a', text: '∑(n=1 to ∞) 1/n', is_correct: false },
      { id: 'b', text: '∑(n=1 to ∞) 1/n²', is_correct: true },
      { id: 'c', text: '∑(n=1 to ∞) (-1)ⁿ', is_correct: false },
      { id: 'd', text: '∑(n=1 to ∞) n/(n+1)', is_correct: false },
    ],
  },
  {
    id: '3',
    question_text:
      'Explain the Fundamental Theorem of Calculus and its two parts. Provide an example illustrating each part.',
    question_type: 'essay' as const,
    max_marks: 15,
    difficulty_level: 4,
    bloom_taxonomy: 'evaluate',
    options: null,
  },
  {
    id: '4',
    question_text:
      'Calculate the volume of the solid obtained by rotating the region bounded by y = x², y = 0, and x = 2 about the x-axis.',
    question_type: 'short_answer' as const,
    max_marks: 10,
    difficulty_level: 3,
    bloom_taxonomy: 'apply',
    options: null,
  },
  {
    id: '5',
    question_text:
      'Which substitution is most appropriate for evaluating ∫ √(9 - x²) dx?',
    question_type: 'mcq' as const,
    max_marks: 5,
    difficulty_level: 2,
    bloom_taxonomy: 'understand',
    options: [
      { id: 'a', text: 'x = 3 tan(θ)', is_correct: false },
      { id: 'b', text: 'x = 3 sin(θ)', is_correct: true },
      { id: 'c', text: 'x = 3 sec(θ)', is_correct: false },
      { id: 'd', text: 'u = 9 - x²', is_correct: false },
    ],
  },
];

function getDifficultyLabel(level: number) {
  const labels = ['', 'Easy', 'Moderate', 'Medium', 'Hard', 'Expert'];
  return labels[level] || 'Medium';
}

function getDifficultyColor(level: number) {
  const colors = ['', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#dc2626'];
  return colors[level] || '#f59e0b';
}

export default function LiveExamPage() {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLockdownWarning, setShowLockdownWarning] = useState(true);

  // Enable exam lockdown
  useExamLockdown('demo-session', !showLockdownWarning);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || showLockdownWarning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showLockdownWarning]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const question = DEMO_QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / DEMO_QUESTIONS.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push('/dashboard/results');
    }, 2000);
  };

  // Lockdown warning screen
  if (showLockdownWarning) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-lg glass-card p-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
            <HiShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Exam Lockdown Mode</h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            This exam will enter <strong className="text-white">lockdown mode</strong>.
            The following restrictions will be active:
          </p>
          <div className="space-y-2 text-left mb-8">
            {[
              'Camera and screen capture will be blocked',
              'Copy, paste, and keyboard shortcuts disabled',
              'Tab switching will be monitored and logged',
              'Fullscreen mode will be enforced',
              'Right-click context menu disabled',
            ].map((rule) => (
              <div
                key={rule}
                className="flex items-center gap-3 text-sm text-zinc-300 p-2 rounded-lg bg-zinc-800/30"
              >
                <HiExclamationTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                {rule}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowLockdownWarning(false)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            I Understand — Begin Exam
            <HiChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col exam-lockdown">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-zinc-800/50"
        style={{
          background: 'rgba(9, 9, 11, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiAcademicCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold hidden sm:block">
            Advanced Mathematics — Calculus II
          </span>
        </div>

        {/* Progress Bar (no countdown anxiety — Finland style) */}
        <div className="flex-1 max-w-xs mx-6">
          <div className="w-full h-1.5 rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 text-center">
            Question {currentQ + 1} of {DEMO_QUESTIONS.length}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-1.5 text-sm font-mono font-medium px-3 py-1 rounded-lg ${
              timeLeft > 600
                ? 'text-zinc-400 bg-zinc-800/50'
                : timeLeft > 120
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-red-400 bg-red-500/10 animate-pulse'
            }`}
          >
            <HiClock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5"
          >
            <HiPaperAirplane className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Question Panel */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1"
            >
              {/* Question Header */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${getDifficultyColor(question.difficulty_level)}15`,
                    color: getDifficultyColor(question.difficulty_level),
                  }}
                >
                  {getDifficultyLabel(question.difficulty_level)}
                </span>
                <span className="text-xs text-zinc-500">
                  {question.max_marks} marks
                </span>
                <span className="text-xs text-zinc-500 capitalize">
                  {question.bloom_taxonomy}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl lg:text-2xl font-semibold leading-relaxed mb-8">
                {question.question_text}
              </h2>

              {/* Answer Input */}
              {question.question_type === 'mcq' && question.options && (
                <div className="space-y-3 max-w-xl">
                  {question.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        answers[question.id] === opt.id
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : 'border-zinc-700/50 bg-zinc-800/20 hover:border-zinc-600 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                          answers[question.id] === opt.id
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {opt.id.toUpperCase()}
                      </div>
                      <span className="text-sm">{opt.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'short_answer' && (
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="input-field max-w-xl text-lg"
                  placeholder="Type your answer..."
                />
              )}

              {question.question_type === 'essay' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="input-field min-h-[200px] max-w-2xl resize-none"
                  placeholder="Write your essay response..."
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-auto border-t border-zinc-800/50">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-30"
            >
              <HiChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="hidden sm:flex gap-1.5">
              {DEMO_QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    idx === currentQ
                      ? 'bg-indigo-500 text-white'
                      : answers[DEMO_QUESTIONS[idx].id]
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (currentQ < DEMO_QUESTIONS.length - 1) {
                  setCurrentQ(currentQ + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="btn-primary flex items-center gap-2"
            >
              {currentQ < DEMO_QUESTIONS.length - 1 ? 'Next' : 'Review & Submit'}
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Panel — Question Navigator (desktop) */}
        <aside className="hidden xl:block w-72 border-l border-zinc-800/50 p-5"
          style={{ background: 'rgba(15, 15, 20, 0.5)' }}
        >
          <h3 className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
            Question Navigator
          </h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {DEMO_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQ(idx)}
                className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                  idx === currentQ
                    ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/30'
                    : answers[q.id]
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500" />
              Current
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/30" />
              Answered ({answeredCount})
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-zinc-800" />
              Unanswered ({DEMO_QUESTIONS.length - answeredCount})
            </div>
          </div>
        </aside>
      </main>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 max-w-md w-full mx-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                  <HiPaperAirplane className="w-7 h-7 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Submit Exam?</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  You have answered{' '}
                  <span className="text-white font-semibold">
                    {answeredCount}
                  </span>{' '}
                  out of{' '}
                  <span className="text-white font-semibold">
                    {DEMO_QUESTIONS.length}
                  </span>{' '}
                  questions.
                </p>

                {answeredCount < DEMO_QUESTIONS.length && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-6 flex items-center gap-2">
                    <HiExclamationTriangle className="w-4 h-4 shrink-0" />
                    You have unanswered questions!
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Continue Exam
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <HiCheckCircle className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
