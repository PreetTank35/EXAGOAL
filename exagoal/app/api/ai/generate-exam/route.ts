import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(req: Request) {
  try {
    const { syllabus_text, question_count, difficulty, question_types, exam_title, duration_minutes } = await req.json();

    if (!syllabus_text || !question_count) {
      return NextResponse.json({ error: 'syllabus_text and question_count are required.' }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key is not configured.' }, { status: 500 });
    }

    const difficultyMap: Record<string, string> = {
      easy: "Bloom's Taxonomy levels: Remember and Understand only. Simple recall questions.",
      medium: "Bloom's Taxonomy levels: Apply and Analyze. Students must apply concepts to new scenarios.",
      hard: "Bloom's Taxonomy levels: Evaluate and Create. Complex critical-thinking and synthesis questions.",
      adaptive: "Mix of all Bloom's Taxonomy levels for a balanced assessment.",
    };

    const typesInstruction = (question_types || ['mcq']).map((t: string) => {
      if (t === 'mcq') return 'Multiple Choice Questions (MCQ) with exactly 4 options and one correct answer';
      if (t === 'short_answer') return 'Short Answer questions requiring 1-3 sentence responses';
      if (t === 'essay') return 'Essay questions requiring detailed paragraph responses';
      return t;
    }).join(', ');

    // Concise prompt = fewer tokens = faster response
    const systemPrompt = `Return ONLY valid JSON. No markdown. No explanation.
Generate ${question_count} ${typesInstruction} questions from the syllabus below.
Difficulty: ${difficultyMap[difficulty] || difficultyMap.medium}
JSON format: {"questions":[{"question_text":"...","question_type":"mcq","options":[{"id":"a","text":"...","is_correct":false},{"id":"b","text":"...","is_correct":true},{"id":"c","text":"...","is_correct":false},{"id":"d","text":"...","is_correct":false}],"correct_answer":"b","max_marks":1,"difficulty_level":3,"bloom_taxonomy":"understand"}]}
For short_answer/essay: omit options, set correct_answer to model answer.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'ExaGoal AI Exam Generator',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: syllabus_text.substring(0, 6000) },
        ],
        temperature: 0.3,
        max_tokens: 4000, // Reduced for speed — sufficient for 20 MCQs
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'AI generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // Aggressively extract the JSON object from the response
    let parsed;
    try {
      // Find the first '{' and the last '}'
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error('No JSON object found in response');
      }

      const jsonString = rawContent.substring(firstBrace, lastBrace + 1);
      parsed = JSON.parse(jsonString);
    } catch (err) {
      return NextResponse.json({
        error: 'AI returned malformed JSON. Please try again.',
        raw: rawContent.substring(0, 500),
      }, { status: 422 });
    }

    // Add order_index to each question
    if (parsed.questions && Array.isArray(parsed.questions)) {
      parsed.questions = parsed.questions.map((q: any, i: number) => ({
        ...q,
        order_index: i + 1,
      }));
    }

    return NextResponse.json({
      success: true,
      exam_title: exam_title || 'AI Generated Exam',
      duration_minutes: duration_minutes || 60,
      question_count: parsed.questions?.length || 0,
      ...parsed,
    });

  } catch (error: any) {
    console.error('AI Exam Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
