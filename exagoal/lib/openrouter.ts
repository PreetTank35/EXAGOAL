import { generateGeminiContent, getGeminiApiKey } from './gemini';

const getApiKey = () => (process.env.OPENROUTER_API_KEY || '').trim().replace(/['"\r\n]/g, '');
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  responseMimeType?: string;
}

// Model selection strategy per use-case
export const AI_MODELS = {
  SOLUTION_GENERATION: 'gemini-2.5-flash',
  ANSWER_GRADING: 'gemini-2.5-flash',
  FEEDBACK_SYNTHESIS: 'gemini-2.5-flash',
  DIFFICULTY_ADAPT: 'gemini-2.5-flash',
  PLAGIARISM_CHECK: 'gemini-2.5-flash',
} as const;

const FALLBACK_MODELS = [
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-oss-20b:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-31b-it:free',
];

export async function callOpenRouter(
  preferredModel: string,
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  // 1. Try Google Gemini 2.5 Flash first if GEMINI_API_KEY is available
  const geminiKey = getGeminiApiKey();
  if (geminiKey) {
    try {
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const nonSystemMessages = messages.filter(m => m.role !== 'system');
      const contents = nonSystemMessages.map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
        parts: [{ text: m.content }],
      }));

      const geminiText = await generateGeminiContent(contents, {
        systemInstruction: systemMessage,
        temperature: options.temperature,
        responseMimeType: options.responseMimeType,
      });

      if (geminiText) return geminiText;
    } catch (geminiErr) {
      console.warn('[AI Service] Gemini direct call failed, falling back to OpenRouter:', geminiErr);
    }
  }
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter(m => m !== preferredModel),
  ];

  let lastError = '';

  for (const model of modelsToTry) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      }

      const error = await response.json().catch(() => ({}));
      lastError = (error as Record<string, Record<string, string>>).error?.message || response.statusText;
      console.warn(`[OpenRouter] ${model} failed: ${lastError}. Trying fallback...`);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[OpenRouter] ${model} error: ${lastError}. Trying fallback...`);
    }
  }

  throw new Error(`OpenRouter Error: All models failed. Last error: ${lastError}`);
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
