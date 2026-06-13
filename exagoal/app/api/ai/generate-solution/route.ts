import { NextResponse } from 'next/server';
import { generateSolution, AI_MODELS, callOpenRouter } from '@/lib/openrouter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_text, question_type, subject } = body;

    if (!question_text) {
      return NextResponse.json(
        { error: 'question_text is required' },
        { status: 400 }
      );
    }

    const result = await generateSolution(
      question_text,
      question_type || 'general',
      subject || 'General'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Solution Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI solution' },
      { status: 500 }
    );
  }
}
