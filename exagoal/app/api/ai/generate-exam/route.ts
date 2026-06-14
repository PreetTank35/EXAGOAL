import { NextResponse } from 'next/server';

export const maxDuration = 60;

/**
 * Aggressively extract JSON from AI responses that may contain:
 * - <think>...</think> reasoning blocks
 * - ```json ... ``` markdown fences
 * - Leading/trailing prose or explanation text
 * - Partial or truncated JSON
 */
function extractJSON(raw: string): string {
  // 1. Strip reasoning blocks (<think>...</think>)
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 2. Try to extract from markdown code fences first (most reliable)
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    // 3. Remove any remaining markdown artifacts
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  }

  // 4. Find the outermost JSON object using brace matching
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('No JSON object found in response');
  }

  // Walk forward and count braces to find the matching closing brace
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return cleaned.substring(firstBrace, i + 1);
      }
    }
  }

  // If braces didn't balance, try lastIndexOf as a fallback
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }

  throw new Error('Unbalanced JSON braces in response');
}

/**
 * Attempt to repair common JSON issues from LLM output:
 * - Trailing commas
 * - Single quotes instead of double quotes
 * - Unquoted keys
 */
function repairJSON(raw: string): string {
  let fixed = raw;

  // Remove trailing commas before } or ]
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');

  // Replace single-quoted strings with double-quoted (simple heuristic)
  // Only do this if there are no double quotes at all
  if (!fixed.includes('"') && fixed.includes("'")) {
    fixed = fixed.replace(/'/g, '"');
  }

  return fixed;
}

export async function POST(req: Request) {
  try {
    const {
      syllabus_text,
      question_count,
      difficulty,
      question_types,
      exam_title,
      duration_minutes,
    } = await req.json();

    if (!syllabus_text || !question_count) {
      return NextResponse.json(
        { error: 'syllabus_text and question_count are required.' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured.' },
        { status: 500 }
      );
    }

    const difficultyMap: Record<string, string> = {
      easy: "Remember and Understand (simple recall)",
      medium: "Apply and Analyze (apply concepts to scenarios)",
      hard: "Evaluate and Create (complex critical thinking)",
      adaptive: "mixed difficulty across all Bloom's levels",
    };

    const types = question_types || ['mcq'];
    const typesInstruction = types
      .map((t: string) => {
        if (t === 'mcq') return 'MCQ with exactly 4 options (a, b, c, d) and one correct answer';
        if (t === 'short_answer') return 'short_answer requiring 1-3 sentences';
        if (t === 'essay') return 'essay requiring detailed paragraphs';
        return t;
      })
      .join(', ');

    const systemPrompt = `You are an expert exam question generator. You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no code fences, no thinking, no preamble.

Generate exactly ${question_count} questions of type: ${typesInstruction}.
Difficulty: ${difficultyMap[difficulty] || difficultyMap.medium}
Topic/Syllabus context is provided by the user.

Required JSON schema (respond with ONLY this structure):
{"questions":[{"question_text":"string","question_type":"mcq","options":[{"id":"a","text":"string","is_correct":false},{"id":"b","text":"string","is_correct":true},{"id":"c","text":"string","is_correct":false},{"id":"d","text":"string","is_correct":false}],"correct_answer":"b","max_marks":1,"difficulty_level":3,"bloom_taxonomy":"understand"}]}

Rules:
- For MCQ: always include all 4 options with ids a/b/c/d; exactly one is_correct = true.
- For short_answer or essay: omit the "options" field entirely. Set correct_answer to a model answer.
- difficulty_level is 1-5 (1=easiest, 5=hardest).
- bloom_taxonomy is one of: remember, understand, apply, analyze, evaluate, create.
- Return ONLY the JSON object. No other text.`;

    // Models to try in order — primary + reliable fallbacks
    const MODELS = [
      'google/gemma-4-31b-it:free',
      'google/gemini-2.0-flash-lite-preview-02-05:free'
    ];

    let rawContent = '';
    let lastError = '';
    let usedModel = '';

    for (const model of MODELS) {
      const controller = new AbortController();
      // Give Gemma more time (30s) since it's a larger model
      const timeoutMs = model.includes('gemma') ? 30000 : 20000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'ExaGoal AI Exam Generator',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Generate ${question_count} questions based on this syllabus:\n\n${syllabus_text.substring(0, 5000)}`,
              },
            ],
            temperature: 0.1,
            max_tokens: 4096,
            top_p: 0.9,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          lastError = (err as Record<string, Record<string, string>>)?.error?.message || `Model ${model} returned ${response.status}`;
          console.error(`[generate-exam] ${model} HTTP error:`, lastError);
          continue;
        }

        const data = await response.json();
        rawContent = data.choices?.[0]?.message?.content || '';

        if (rawContent.trim()) {
          usedModel = model;
          break;
        } else {
          lastError = `Model ${model} returned an empty response`;
          console.error(`[generate-exam] ${model}: empty response`);
        }
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error.name === 'AbortError' 
          ? `Model ${model} timed out after ${timeoutMs / 1000}s` 
          : error.message;
        console.error(`[generate-exam] ${model} exception:`, lastError);
        continue;
      }
    }

    if (!rawContent.trim()) {
      return NextResponse.json(
        { error: lastError || 'All AI models failed. Please try again.' },
        { status: 502 }
      );
    }

    // Parse with multi-stage JSON extraction
    let parsed: Record<string, unknown>;

    // Stage 1: Try extractJSON (handles think blocks, fences, brace matching)
    try {
      const jsonString = extractJSON(rawContent);
      parsed = JSON.parse(jsonString);
    } catch {
      // Stage 2: Try with JSON repair (trailing commas, etc.)
      try {
        const jsonString = extractJSON(rawContent);
        const repaired = repairJSON(jsonString);
        parsed = JSON.parse(repaired);
      } catch {
        // Stage 3: Try parsing raw content directly
        try {
          parsed = JSON.parse(rawContent.trim());
        } catch {
          // Stage 4: Try repairing raw content
          try {
            const repaired = repairJSON(rawContent.trim());
            parsed = JSON.parse(repaired);
          } catch {
            console.error(`[generate-exam] All JSON parsing failed. Model: ${usedModel}`);
            console.error(`[generate-exam] Raw response (first 500 chars):`, rawContent.substring(0, 500));
            return NextResponse.json(
              {
                error: 'AI returned malformed JSON. Please try again — the model may be overloaded.',
                debug: rawContent.substring(0, 300),
              },
              { status: 422 }
            );
          }
        }
      }
    }

    // Validate and normalise questions array
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      // Some models wrap questions differently — try to find any array
      const maybeArray = Object.values(parsed).find(Array.isArray) as Record<string, unknown>[] | undefined;
      if (maybeArray) {
        parsed.questions = maybeArray;
      } else {
        console.error(`[generate-exam] No questions array found. Keys:`, Object.keys(parsed));
        return NextResponse.json(
          { error: 'AI did not return a questions array. Please try again.' },
          { status: 422 }
        );
      }
    }

    // Stamp order_index on each question
    const questions = parsed.questions as Record<string, unknown>[];
    parsed.questions = questions.map((q, i) => ({
      ...q,
      order_index: i + 1,
    }));

    return NextResponse.json({
      success: true,
      exam_title: exam_title || 'AI Generated Exam',
      duration_minutes: duration_minutes || 60,
      question_count: (parsed.questions as unknown[]).length,
      ...parsed,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('AI Exam Generation Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
