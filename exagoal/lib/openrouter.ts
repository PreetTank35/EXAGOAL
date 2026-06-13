// ============================================================
// OpenRouter API Client — Multi-Model AI Integration
// ============================================================

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

// Model selection strategy per use-case
export const AI_MODELS = {
  SOLUTION_GENERATION: 'anthropic/claude-sonnet-4-20250514',
  ANSWER_GRADING: 'openai/gpt-4o',
  FEEDBACK_SYNTHESIS: 'google/gemini-2.5-flash',
  DIFFICULTY_ADAPT: 'google/gemini-2.5-flash',
  PLAGIARISM_CHECK: 'anthropic/claude-sonnet-4-20250514',
} as const;

export async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://exagoal.com',
      'X-Title': 'ExaGoal Examination Platform',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 2048,
      top_p: options.top_p ?? 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter Error: ${(error as Record<string, Record<string, string>>).error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/** Generate a model solution + rubric for a given question */
export async function generateSolution(
  questionText: string,
  questionType: string,
  subject: string
): Promise<{ solution: string; rubric: Record<string, unknown> }> {
  const systemPrompt = `You are an expert educator creating model solutions.
Your solutions must:
1. Be pedagogically sound and clearly structured
2. Show step-by-step reasoning (not just the answer)
3. Reference Bloom's Taxonomy levels where applicable
4. Include a grading rubric as a JSON object
5. Consider both analytical and creative problem-solving approaches

Subject: ${subject}
Question Type: ${questionType}`;

  const response = await callOpenRouter(
    AI_MODELS.SOLUTION_GENERATION,
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Generate a model solution and rubric for:\n\n${questionText}`,
      },
    ],
    { temperature: 0.2, max_tokens: 4096 }
  );

  const rubricMatch = response.match(/```json\n([\s\S]*?)\n```/);
  const rubric = rubricMatch ? JSON.parse(rubricMatch[1]) : {};
  const solution = response.replace(/```json[\s\S]*?```/, '').trim();

  return { solution, rubric };
}

/** AI-grade a student's answer */
export async function gradeAnswer(
  questionText: string,
  modelSolution: string,
  studentAnswer: string,
  maxMarks: number,
  rubric: Record<string, unknown>
): Promise<{ marks: number; feedback: string; confidence: number }> {
  const systemPrompt = `You are a fair, consistent exam grader.
Grade the student's answer against the model solution and rubric.
Return ONLY a JSON object (no markdown) with:
- marks: number (0 to ${maxMarks})
- feedback: string (constructive, specific, encouraging)
- confidence: number (0.0 to 1.0)
- concept_gaps: string[]`;

  const response = await callOpenRouter(
    AI_MODELS.ANSWER_GRADING,
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: JSON.stringify({
          question: questionText,
          model_solution: modelSolution,
          student_answer: studentAnswer,
          rubric,
        }),
      },
    ],
    { temperature: 0.1 }
  );

  try {
    return JSON.parse(response);
  } catch {
    return { marks: 0, feedback: response, confidence: 0 };
  }
}

/** Determine the next question difficulty based on performance history */
export async function getNextDifficulty(
  performanceHistory: { difficulty: number; correct: boolean }[],
  currentDifficulty: number
): Promise<number> {
  // Simple deterministic fallback (no API call needed for basic logic)
  const recent = performanceHistory.slice(-2);
  if (recent.length >= 2) {
    if (recent.every((r) => r.correct)) {
      return Math.min(5, currentDifficulty + 1);
    }
    if (recent.every((r) => !r.correct)) {
      return Math.max(1, currentDifficulty - 1);
    }
  }
  return currentDifficulty;
}
