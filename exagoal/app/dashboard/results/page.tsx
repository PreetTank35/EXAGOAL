'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiSparkles,
  HiLightBulb,
  HiArrowRight,
  HiChartBar,
} from 'react-icons/hi2';

const DEMO_RESULTS = [
  {
    id: 'session-1',
    exam_title: 'Advanced Mathematics — Calculus II',
    exam_type: 'knowledge',
    completed_at: '2026-06-10T12:45:00Z',
    total_score: 85,
    max_score: 100,
    grade: 'A',
    chi_contribution: 85,
    toku_contribution: 0,
    tai_contribution: 0,
    integrity_score: 98,
    time_taken: '78 min',
    questions_answered: 25,
    total_questions: 25,
    ai_feedback: {
      strengths: [
        'Excellent integration technique mastery',
        'Strong understanding of series convergence tests',
        'Clear and well-structured solutions',
      ],
      concept_gaps: [
        { concept: 'Multivariable Chain Rule', severity: 'medium' as const },
        { concept: 'Polar Coordinate Integration', severity: 'low' as const },
      ],
      study_plan:
        'Focus on multivariable calculus for the next 2 weeks. Practice polar coordinate problems from Chapter 12.',
      encouragement:
        "Outstanding performance! Your consistent effort in calculus is clearly paying off. Keep pushing your boundaries — you're ready for more advanced challenges.",
    },
  },
  {
    id: 'session-2',
    exam_title: 'Ethical Reasoning — Case Studies',
    exam_type: 'ethical',
    completed_at: '2026-06-08T15:30:00Z',
    total_score: 78,
    max_score: 100,
    grade: 'B+',
    chi_contribution: 0,
    toku_contribution: 78,
    tai_contribution: 0,
    integrity_score: 100,
    time_taken: '52 min',
    questions_answered: 10,
    total_questions: 10,
    ai_feedback: {
      strengths: [
        'Thoughtful consideration of multiple stakeholders',
        'Good identification of ethical frameworks',
      ],
      concept_gaps: [
        { concept: 'Utilitarian vs. Deontological Analysis', severity: 'medium' as const },
      ],
      study_plan:
        'Review ethical frameworks comparison. Practice applying different frameworks to the same scenario.',
      encouragement:
        'Your ethical reasoning is developing well. The ability to see multiple perspectives is a valuable strength.',
    },
  },
  {
    id: 'session-3',
    exam_title: 'Wellness Self-Assessment',
    exam_type: 'wellness_check',
    completed_at: '2026-06-05T09:00:00Z',
    total_score: 71,
    max_score: 100,
    grade: 'B',
    chi_contribution: 0,
    toku_contribution: 0,
    tai_contribution: 71,
    integrity_score: 100,
    time_taken: '12 min',
    questions_answered: 12,
    total_questions: 12,
    ai_feedback: {
      strengths: [
        'Honest self-reflection',
        'Awareness of stress triggers',
      ],
      concept_gaps: [
        { concept: 'Work-Life Balance', severity: 'high' as const },
      ],
      study_plan:
        'Incorporate 15-minute mindfulness breaks between study sessions. Consider joining a study group for social support.',
      encouragement:
        'Self-awareness is the first step to growth. Remember: rest is part of learning, not the opposite of it.',
    },
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

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high':
      return '#ef4444';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#22c55e';
    default:
      return '#71717a';
  }
}

export default function ResultsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Exam Results</h1>
        <p className="text-zinc-400 text-sm mt-1">
          AI-generated feedback and detailed performance analysis
        </p>
      </div>

      <div className="space-y-6">
        {DEMO_RESULTS.map((result, idx) => (
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
                      result.total_score >= 85
                        ? 'bg-green-500/10 text-green-400'
                        : result.total_score >= 70
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
                      <li
                        key={s}
                        className="text-xs text-zinc-300 flex items-start gap-2"
                      >
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
                  <ul className="space-y-1.5">
                    {result.ai_feedback.concept_gaps.map((gap) => (
                      <li
                        key={gap.concept}
                        className="text-xs text-zinc-300 flex items-center gap-2"
                      >
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
