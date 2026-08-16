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

    const geminiKey = process.env.GEMINI_API_KEY?.trim().replace(/['"\r\n]/g, '');
    const apiKey = process.env.OPENROUTER_API_KEY?.trim().replace(/['"\r\n]/g, '');

    if (!apiKey && !geminiKey) {
      return NextResponse.json(
        { error: 'Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured.' },
        { status: 500 }
      );
    }

    const difficultyMap: Record<string, string> = {
      easy: "Remember and Understand (foundational concepts, clear recall)",
      medium: "Apply and Analyze (applying formulas, case scenarios, problem solving)",
      hard: "Evaluate and Create (complex multi-step problems, critical thinking)",
      adaptive: "Balanced mix spanning Bloom's Taxonomy from foundational to advanced",
    };

    const types = question_types || ['mcq'];
    const typesInstruction = types
      .map((t: string) => {
        if (t === 'mcq') return 'Multiple Choice Questions (MCQ with 4 distinct options a, b, c, d)';
        if (t === 'short_answer') return 'Short Answer questions (concise 1-3 sentence answers)';
        if (t === 'essay') return 'Essay/Long Answer questions (in-depth conceptual explanations)';
        return t;
      })
      .join(', ');

    const countNum = parseInt(String(question_count), 10) || 10;

    const systemPrompt = `You are an expert university professor and examination board paper author.
Your task is to generate an exam paper with EXACTLY ${countNum} distinct, high-quality, comprehensive questions based on the syllabus provided.

CRITICAL RULES:
1. You MUST generate an array of EXACTLY ${countNum} questions in the "questions" array.
2. Every question and answer option must be fully formulated and specific to the syllabus. NEVER use placeholder text like "string" or "dummy".
3. Question types allowed: ${typesInstruction}.
4. Difficulty Level: ${difficultyMap[difficulty] || difficultyMap.medium}.
5. For MCQ: always provide 4 distinct options with ids "a", "b", "c", "d". Exactly one option must have is_correct: true.
6. For short_answer or essay: omit the "options" array. Set correct_answer to a complete model answer.
7. Set difficulty_level (1-5) and bloom_taxonomy (remember, understand, apply, analyze, evaluate, create) accurately for each question.
8. Output ONLY a valid JSON object with the "questions" key. No markdown fences, no explanatory text.`;

    // 1. Try Google Gemini 2.5 Flash first if GEMINI_API_KEY is available
    let rawContent = '';
    let usedModel = '';
    let lastError = '';

    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const userPrompt = `Syllabus / Topics:\n${syllabus_text.substring(0, 8000)}\n\nGenerate EXACTLY ${countNum} comprehensive exam questions based on this syllabus.`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawContent.trim()) {
            usedModel = 'google/gemini-2.5-flash (Direct)';
          }
        } else {
          const errData = await geminiRes.json().catch(() => ({}));
          lastError = errData.error?.message || `Gemini returned HTTP ${geminiRes.status}`;
          console.warn('[generate-exam] Gemini direct call failed, attempting fallback...', lastError);
        }
      } catch (geminiErr: unknown) {
        lastError = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        console.warn('[generate-exam] Gemini direct call exception, attempting fallback...', lastError);
      }
    }

    // 2. OpenRouter fallback if Gemini wasn't used or failed
    if (!rawContent && apiKey) {
      // Models to try in order — primary + reliable fallbacks
      const MODELS = [
        'nvidia/nemotron-3.5-lightning:free',
        'google/gemma-4-26b-a4b-it:free',
        'openai/gpt-oss-20b:free',
        'liquid/lfm-2.5-2.6b:free',
        'google/gemma-4-31b-it:free',
      ];

      for (const model of MODELS) {
        const controller = new AbortController();
        const timeoutMs = model.includes('gemma') ? 30000 : 20000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
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
                  content: `Syllabus / Topics:\n${syllabus_text.substring(0, 5000)}\n\nGenerate EXACTLY ${countNum} comprehensive exam questions based on this syllabus.`,
                },
              ],
              temperature: 0.7,
              max_tokens: 8192,
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
          }
        } catch (err: unknown) {
          clearTimeout(timeoutId);
          const error = err instanceof Error ? err : new Error(String(err));
          lastError = error.name === 'AbortError' 
            ? `Model ${model} timed out after ${timeoutMs / 1000}s` 
            : error.message;
          console.error(`[generate-exam] ${model} fetch exception:`, lastError);
        }
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
