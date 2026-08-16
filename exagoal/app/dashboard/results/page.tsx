'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiCheckCircle,
  HiClock,
  HiSparkles,
  HiLightBulb,
  HiChartBar,
} from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

interface ConceptGap {
  concept: string;
  severity: 'high' | 'medium' | 'low';
}

interface AIFeedback {
  strengths: string[];
  concept_gaps: ConceptGap[];
  study_plan: string;
  encouragement: string;
}

interface ExamResult {
  id: string;
  exam_title: string;
  exam_type: string;
  completed_at: string;
  total_score: number;
  max_score: number;
  grade: string;
  time_taken: string;
  questions_answered: number;
  total_questions: number;
  ai_feedback: AIFeedback;
}

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

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#22c55e';
    default: return '#71717a';
  }
}

function computeGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 85) return 'A';
  if (pct >= 80) return 'A-';
  if (pct >= 75) return 'B+';
  if (pct >= 70) return 'B';
  if (pct >= 65) return 'B-';
  if (pct >= 60) return 'C+';
  if (pct >= 55) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadResults() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch completed exam sessions for this student
        const { data: sessions, error: sessionsErr } = await supabase
          .from('exam_sessions')
          .select(`
            id,
            exam_id,
            total_score,
            started_at,
            submitted_at,
            status,
            exams(title, exam_type, duration_minutes)
          `)
          .eq('student_id', user.id)
          .in('status', ['submitted', 'graded'])
          .order('submitted_at', { ascending: false });

        if (sessionsErr || !sessions) {
          console.error('Error loading results:', sessionsErr);
          return;
        }

        // For each session, fetch question and answer details
        const resultsData: ExamResult[] = [];

        for (const session of sessions) {
          // Fetch questions for this exam
          const { data: questions } = await supabase
            .from('questions')
            .select('id, max_marks')
            .eq('exam_id', session.exam_id);

          const totalQuestions = questions?.length || 0;
          const maxScore = questions?.reduce((sum: number, q: { max_marks: number }) => sum + (q.max_marks || 0), 0) || 100;

          // Fetch answers for this session
          const { data: answers } = await supabase
            .from('answers')
            .select('id, score, ai_feedback')
            .eq('session_id', session.id);

          const questionsAnswered = answers?.length || 0;
          const totalScore = session.total_score || 
            (answers?.reduce((sum: number, a: { score: number | null }) => sum + (a.score || 0), 0) || 0);

          // Calculate time taken
          let timeTaken = '—';
          if (session.started_at && session.submitted_at) {
            const diffMs = new Date(session.submitted_at).getTime() - new Date(session.started_at).getTime();
            const mins = Math.floor(diffMs / 60000);
            timeTaken = `${mins} min`;
          }

          // Aggregate AI feedback from individual answers
          const strengths: string[] = [];
          const conceptGaps: ConceptGap[] = [];
          let studyPlan = '';
          let encouragement = '';

          if (answers && answers.length > 0) {
            const feedbackTexts = answers
              .filter((a: { ai_feedback: string | null }) => !!a.ai_feedback)
              .map((a: { ai_feedback: string | null }) => a.ai_feedback as string);

            if (feedbackTexts.length > 0) {
              // Extract key patterns from feedback
              const correctCount = feedbackTexts.filter((f: string) => f.toLowerCase().includes('correct')).length;
              if (correctCount > feedbackTexts.length * 0.7) {
                strengths.push('Strong overall accuracy');
              }
              if (correctCount > 0) {
                strengths.push(`${correctCount} of ${feedbackTexts.length} answers graded positively`);
              }

              const incorrectFeedback = feedbackTexts.filter((f: string) => 
                f.toLowerCase().includes('incorrect') || f.toLowerCase().includes('wrong')
              );
              if (incorrectFeedback.length > 0) {
                conceptGaps.push({
                  concept: `${incorrectFeedback.length} question(s) need review`,
                  severity: incorrectFeedback.length > totalQuestions * 0.3 ? 'high' : 'medium',
                });
              }
            }
          }

          // Generate default feedback if none available
          const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
          if (strengths.length === 0) {
            if (pct >= 80) strengths.push('Excellent performance overall');
            else if (pct >= 60) strengths.push('Good understanding of core concepts');
            else strengths.push('Attempted the exam — keep practicing');
          }

          if (pct >= 90) {
            encouragement = 'Outstanding work! Your preparation clearly shows. Keep pushing for excellence.';
            studyPlan = 'Review any remaining gaps and explore advanced topics in this area.';
          } else if (pct >= 70) {
            encouragement = 'Good performance! Focus on the areas highlighted for improvement.';
            studyPlan = 'Revisit the concepts you found challenging and practice similar problems.';
          } else if (pct >= 50) {
            encouragement = 'You\'re making progress! Consistent practice will improve your scores.';
            studyPlan = 'Review the fundamentals of each topic. Consider working through practice problems.';
          } else {
            encouragement = 'Don\'t give up — every attempt is a step forward. Focus on understanding the basics.';
            studyPlan = 'Start with the core concepts and build up gradually. Reach out to your instructor for help.';
          }

          // @ts-ignore — nested join
          const examTitle = session.exams?.title || 'Exam';
          // @ts-ignore
          const examType = session.exams?.exam_type || 'knowledge';

          resultsData.push({
            id: session.id,
            exam_title: examTitle,
            exam_type: examType,
            completed_at: session.submitted_at || session.started_at || new Date().toISOString(),
            total_score: totalScore,
            max_score: maxScore,
            grade: computeGrade(pct),
            time_taken: timeTaken,
            questions_answered: questionsAnswered,
            total_questions: totalQuestions,
            ai_feedback: {
              strengths,
              concept_gaps: conceptGaps,
              study_plan: studyPlan,
              encouragement,
            },
          });
        }

        setResults(resultsData);
      } catch (err) {
        console.error('Error loading results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {results.length > 0
            ? 'AI-generated feedback and detailed performance analysis'
            : 'No completed exams yet. Your results will appear here after you submit an exam.'}
        </p>
      </div>

      <div className="space-y-6">
        {results.map((result, idx) => (
          <motion.div
            key={result.id}
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            {/* Result Header */}
            <div className="p-6 border-b border-zinc-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: getExamTypeColor(result.exam_type) }}
                    />
                    <h3 className="text-lg font-semibold">{result.exam_title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <HiClock className="w-3 h-3" />
                      {result.time_taken}
                    </span>
                    <span>
                      {result.questions_answered}/{result.total_questions} answered
                    </span>
                    <span>
                      {new Date(result.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: getExamTypeColor(result.exam_type) }}
                    >
                      {result.total_score}
                    </div>
                    <div className="text-xs text-zinc-500">
                      / {result.max_score}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold px-3 py-1 rounded-lg ${
                      result.total_score / result.max_score >= 0.85
                        ? 'bg-green-500/10 text-green-400'
                        : result.total_score / result.max_score >= 0.7
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {result.grade}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiSparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold text-indigo-300">
                  AI-Generated Feedback
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                  <h5 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5" />
                    Strengths
                  </h5>
                  <ul className="space-y-1.5">
                    {result.ai_feedback.strengths.map((s) => (
                      <li key={s} className="text-xs text-zinc-300 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concept Gaps */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <h5 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
                    <HiLightBulb className="w-3.5 h-3.5" />
                    Areas for Growth
                  </h5>
                  {result.ai_feedback.concept_gaps.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.ai_feedback.concept_gaps.map((gap) => (
                        <li key={gap.concept} className="text-xs text-zinc-300 flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: getSeverityColor(gap.severity) }}
                          />
                          {gap.concept}
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${getSeverityColor(gap.severity)}15`,
                              color: getSeverityColor(gap.severity),
                            }}
                          >
                            {gap.severity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-400">No major gaps identified — great work!</p>
                  )}
                </div>
              </div>

              {/* Study Plan */}
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                <h5 className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-1">
                  <HiChartBar className="w-3.5 h-3.5" />
                  Recommended Study Plan
                </h5>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {result.ai_feedback.study_plan}
                </p>
              </div>

              {/* Encouragement */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  &ldquo;{result.ai_feedback.encouragement}&rdquo;
                </p>
                <p className="text-[10px] text-zinc-500 mt-2 text-right">
                  — ExaGoal AI Mentor
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
