// ============================================================
// Holistic Scoring Engine — Chi-Toku-Tai (知徳体)
// ============================================================

import type { ExamResult, HolisticScore } from './types';

/**
 * Calculate a holistic score across three dimensions:
 * - Chi (知) — Knowledge: academic + critical thinking exams
 * - Toku (徳) — Virtue: ethical reasoning + collaborative exams
 * - Tai (体) — Body/Wellness: self-assessment + wellness checks
 *
 * Weights inspired by Finland's equity philosophy:
 * all dimensions matter, not just academics.
 */
export function calculateHolisticScore(
  examResults: ExamResult[]
): HolisticScore {
  const chiExams = examResults.filter((e) =>
    ['knowledge', 'reasoning'].includes(e.exam_type)
  );
  const tokuExams = examResults.filter((e) =>
    ['ethical', 'collaborative'].includes(e.exam_type)
  );
  const taiExams = examResults.filter((e) =>
    e.exam_type === 'wellness_check'
  );

  const avg = (arr: ExamResult[]) =>
    arr.length > 0
      ? arr.reduce((sum, e) => sum + e.percentage, 0) / arr.length
      : 0;

  const chi = Math.round(avg(chiExams) * 100) / 100;
  const toku = Math.round(avg(tokuExams) * 100) / 100;
  const tai = Math.round(avg(taiExams) * 100) / 100;

  // Weighted composite: Knowledge 40%, Virtue 35%, Wellness 25%
  const overall = Math.round((chi * 0.4 + toku * 0.35 + tai * 0.25) * 100) / 100;

  const insights = generateInsights(chi, toku, tai);

  return { chi, toku, tai, overall, insights };
}

/** Generate growth insights based on dimension scores */
function generateInsights(chi: number, toku: number, tai: number): string[] {
  const insights: string[] = [];

  if (chi >= 80) {
    insights.push('Strong academic foundation — consider taking on more challenging analytical tasks.');
  } else if (chi < 50) {
    insights.push('Focus on building core knowledge through structured practice and review sessions.');
  }

  if (toku >= 80) {
    insights.push('Excellent ethical reasoning and collaboration skills — a natural team leader.');
  } else if (toku < 50) {
    insights.push('Engage more in collaborative exercises and ethical case studies for balanced growth.');
  }

  if (tai >= 80) {
    insights.push('Great self-awareness and wellness habits — keep maintaining balance.');
  } else if (tai < 50) {
    insights.push('Remember: rest and reflection are part of growth. Consider wellness-focused activities.');
  }

  if (insights.length === 0) {
    insights.push('Steady progress across all dimensions. Keep the balanced approach going!');
  }

  return insights;
}

/** Get label and emoji for a dimension */
export function getDimensionInfo(dimension: 'chi' | 'toku' | 'tai') {
  const info = {
    chi: { label: 'Knowledge (知)', emoji: '📊', color: '#6366f1' },
    toku: { label: 'Virtue (徳)', emoji: '🤝', color: '#8b5cf6' },
    tai: { label: 'Wellness (体)', emoji: '🧘', color: '#06b6d4' },
  };
  return info[dimension];
}

/** Get a letter grade from a percentage */
export function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D';
  return 'F';
}
