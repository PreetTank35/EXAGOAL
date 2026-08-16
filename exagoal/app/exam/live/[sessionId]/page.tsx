'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
} from 'react-icons/hi2';
import { useExamLockdown } from '@/hooks/useExamLockdown';
import { createClient } from '@/lib/supabase/client';

interface ExamQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'short_answer' | 'essay';
  max_marks: number;
  difficulty_level: number;
  bloom_taxonomy: string;
  order_index: number;
  options: { id: string; text: string; is_correct: boolean }[] | null;
}

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
  const params = useParams();
  const sessionId = params.sessionId as string;
  const supabase = createClient();

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [examId, setExamId] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLockdownWarning, setShowLockdownWarning] = useState(true);

  // Enable exam lockdown
  useExamLockdown(sessionId, !showLockdownWarning);

  // Load exam data from database
  useEffect(() => {
    async function loadExam() {
      try {
        // 1. Get session info
        const { data: session, error: sessionErr } = await supabase
          .from('exam_sessions')
          .select('exam_id, started_at, exams(title, duration_minutes)')
          .eq('id', sessionId)
          .single();

        if (sessionErr || !session) {
          console.error('Session not found:', sessionErr);
          return;
        }

        // @ts-ignore
        const title = session.exams?.title || 'Exam';
        // @ts-ignore
        const durationMins = session.exams?.duration_minutes || 60;
        setExamTitle(title);
        setExamId(session.exam_id);

        // Calculate remaining time
        const startedAt = session.started_at ? new Date(session.started_at) : new Date();
        const endsAt = new Date(startedAt.getTime() + durationMins * 60 * 1000);
        const remaining = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);

        // 2. Load questions for this exam
        const { data: questionsData, error: questionsErr } = await supabase
          .from('questions')
          .select('id, question_text, question_type, max_marks, difficulty_level, bloom_taxonomy, order_index, options')
          .eq('exam_id', session.exam_id)
          .order('order_index', { ascending: true });

        if (questionsErr) {
          console.error('Failed to load questions:', questionsErr);
          return;
        }

        setQuestions(questionsData || []);

        // 3. Load any previously saved answers (for resume)
        const { data: savedAnswers } = await supabase
          .from('answers')
          .select('question_id, student_answer')
          .eq('session_id', sessionId);

        if (savedAnswers && savedAnswers.length > 0) {
          const answerMap: Record<string, string> = {};
          savedAnswers.forEach((a: { question_id: string; student_answer: string }) => {
            answerMap[a.question_id] = a.student_answer;
          });
          setAnswers(answerMap);
        }
      } catch (err) {
        console.error('Error loading exam:', err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [sessionId]);

  // Timer countdown and auto-submit
  useEffect(() => {
    if (timeLeft <= 0 && !loading && questions.length > 0) {
      if (!submitting) {
        handleSubmit();
      }
      return;
    }
    if (showLockdownWarning || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showLockdownWarning, submitting, loading]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const question = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = async (answer: string) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));

    // Auto-save answer to database (upsert)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('answers')
        .upsert({
          session_id: sessionId,
          question_id: question.id,
          student_id: user.id,
          student_answer: answer,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id,question_id' });
    } catch {
      // Silent fail — don't disrupt exam
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Save all remaining answers
      const answersToUpsert = Object.entries(answers).map(([questionId, answer]) => ({
        session_id: sessionId,
        question_id: questionId,
        student_id: user.id,
        student_answer: answer,
        updated_at: new Date().toISOString(),
      }));

      if (answersToUpsert.length > 0) {
        await supabase
          .from('answers')
          .upsert(answersToUpsert, { onConflict: 'session_id,question_id' });
      }

      // 2. Auto-grade MCQ questions
      let totalScore = 0;
      let maxPossible = 0;

      for (const q of questions) {
        maxPossible += q.max_marks;
        const studentAnswer = answers[q.id];
        if (!studentAnswer) continue;

        if (q.question_type === 'mcq' && q.options) {
          const correctOption = q.options.find((o: { id: string; text: string; is_correct: boolean }) => o.is_correct);
          if (correctOption && studentAnswer === correctOption.id) {
            totalScore += q.max_marks;

            // Update individual answer score
            await supabase
              .from('answers')
              .update({ score: q.max_marks, ai_feedback: 'Correct answer.' })
              .eq('session_id', sessionId)
              .eq('question_id', q.id);
          } else {
            await supabase
              .from('answers')
              .update({ score: 0, ai_feedback: `Incorrect. The correct answer was: ${correctOption?.text || 'N/A'}` })
              .eq('session_id', sessionId)
              .eq('question_id', q.id);
          }
        }
        // Short answer and essay will be graded by AI asynchronously later
      }

      // 3. Trigger AI grading for non-MCQ questions (fire and forget)
      const nonMcqQuestions = questions.filter((q: ExamQuestion) => q.question_type !== 'mcq' && !!answers[q.id]);
      for (const q of nonMcqQuestions) {
        fetch('/api/ai/grade-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_text: q.question_text,
            model_solution: '',
            student_answer: answers[q.id],
            max_marks: q.max_marks,
            rubric: { bloom_taxonomy: q.bloom_taxonomy },
          }),
        })
          .then(res => res.json())
          .then(result => {
            if (result.score !== undefined) {
              supabase
                .from('answers')
                .update({
                  score: result.score,
                  ai_feedback: result.feedback || result.explanation || '',
                })
                .eq('session_id', sessionId)
                .eq('question_id', q.id)
                .then(() => {});
            }
          })
          .catch(() => {}); // Silent fail
      }

      // 4. Update session status to submitted
      await supabase
        .from('exam_sessions')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          total_score: totalScore,
        })
        .eq('id', sessionId);

      // 5. Navigate to results
      router.push('/dashboard/results');
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  // No questions found
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card p-8 text-center max-w-md">
          <HiExclamationTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Questions Found</h2>
          <p className="text-sm text-zinc-400 mb-6">
            This exam has no questions yet. Please contact your instructor.
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold mb-1">{examTitle}</h1>
          <p className="text-sm text-zinc-500 mb-4">{questions.length} questions · {formatTime(timeLeft)} remaining</p>
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
            {examTitle}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-xs mx-6">
          <div className="w-full h-1.5 rounded-full bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 text-center">
            Question {currentQ + 1} of {questions.length}
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
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    idx === currentQ
                      ? 'bg-indigo-500 text-white'
                      : answers[questions[idx].id]
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
                if (currentQ < questions.length - 1) {
                  setCurrentQ(currentQ + 1);
                } else {
                  setShowSubmitModal(true);
                }
              }}
              className="btn-primary flex items-center gap-2"
            >
              {currentQ < questions.length - 1 ? 'Next' : 'Review & Submit'}
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
            {questions.map((q, idx) => (
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
              Unanswered ({questions.length - answeredCount})
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
                    {questions.length}
                  </span>{' '}
                  questions.
                </p>

                {answeredCount < questions.length && (
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
