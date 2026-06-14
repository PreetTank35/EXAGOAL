import { NextResponse } from 'next/server';

export const maxDuration = 60;

// Strip markdown code fences and extract the first valid JSON object
function extractJSON(raw: string): string {
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find the outermost JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('No JSON object found in response');
  }

  return cleaned.substring(firstBrace, lastBrace + 1);
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

    // Tight, explicit schema in the prompt for fast + accurate generation
    const systemPrompt = `You are an expert exam question generator. You MUST respond with ONLY a valid JSON object — no markdown, no explanation, no code fences.

Generate exactly ${question_count} questions of type: ${typesInstruction}.
Difficulty: ${difficultyMap[difficulty] || difficultyMap.medium}
Topic/Syllabus context is provided by the user.

Required JSON schema (respond with this exact structure):
{
  "questions": [
    {
      "question_text": "string",
      "question_type": "mcq" | "short_answer" | "essay",
      "options": [
        {"id": "a", "text": "string", "is_correct": false},
        {"id": "b", "text": "string", "is_correct": true},
        {"id": "c", "text": "string", "is_correct": false},
        {"id": "d", "text": "string", "is_correct": false}
      ],
      "correct_answer": "b",
      "max_marks": 1,
      "difficulty_level": 3,
      "bloom_taxonomy": "understand"
    }
  ]
}

Rules:
- For MCQ: always include all 4 options with ids a/b/c/d; exactly one is_correct = true.
- For short_answer or essay: omit the "options" field entirely. Set correct_answer to a model answer.
- difficulty_level is 1-5 (1=easiest, 5=hardest).
- bloom_taxonomy is one of: remember, understand, apply, analyze, evaluate, create.
- Return ONLY the JSON. No preamble, no suffix.`;

    // Use reliable free models on OpenRouter
    const MODELS = [
      'nvidia/llama-nemotron-rerank-vl-1b-v2:free',
      'google/gemini-2.0-flash-lite-preview-02-05:free',
      'google/gemini-2.0-flash-exp:free',
      'nvidia/llama-3.1-nemotron-70b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free'
    ];

    let rawContent = '';
    let lastError = '';

    for (const model of MODELS) {
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
            temperature: 0.2,
            max_tokens: 3000,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          lastError = err?.error?.message || `Model ${model} returned ${response.status}`;
          continue; // try next model
        }

        const data = await response.json();
        rawContent = data.choices?.[0]?.message?.content || '';

        if (rawContent.trim()) break; // Got a response, stop trying models
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    if (!rawContent.trim()) {
      return NextResponse.json(
        { error: lastError || 'All AI models failed. Please try again.' },
        { status: 502 }
      );
    }

    // Parse with aggressive JSON extraction
    let parsed: any;
    try {
      const jsonString = extractJSON(rawContent);
      parsed = JSON.parse(jsonString);
    } catch {
      // Last resort: try parsing the raw content directly
      try {
        parsed = JSON.parse(rawContent.trim());
      } catch {
        console.error('Malformed AI response:', rawContent.substring(0, 1000));
        return NextResponse.json(
          {
            error: 'AI returned malformed JSON. The AI model may be overloaded — please try again in a moment.',
            debug: rawContent.substring(0, 300),
          },
          { status: 422 }
        );
      }
    }

    // Validate and normalise questions array
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      // Some models wrap questions differently — try to find any array
      const maybeArray = Object.values(parsed).find(Array.isArray) as any[] | undefined;
      if (maybeArray) {
        parsed.questions = maybeArray;
      } else {
        return NextResponse.json(
          { error: 'AI did not return a questions array. Please try again.' },
          { status: 422 }
        );
      }
    }

    // Stamp order_index on each question
    parsed.questions = parsed.questions.map((q: any, i: number) => ({
      ...q,
      order_index: i + 1,
    }));

    return NextResponse.json({
      success: true,
      exam_title: exam_title || 'AI Generated Exam',
      duration_minutes: duration_minutes || 60,
      question_count: parsed.questions.length,
      ...parsed,
    });
  } catch (error: any) {
    console.error('AI Exam Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
