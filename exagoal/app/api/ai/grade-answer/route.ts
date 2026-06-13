import { NextResponse } from 'next/server';
import { gradeAnswer } from '@/lib/openrouter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_text, model_solution, student_answer, max_marks, rubric } = body;

    if (!question_text || !student_answer) {
      return NextResponse.json(
        { error: 'question_text and student_answer are required' },
        { status: 400 }
      );
    }

    const result = await gradeAnswer(
      question_text,
      model_solution || '',
      student_answer,
      max_marks || 10,
      rubric || {}
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Grading Error:', error);
    return NextResponse.json(
      { error: 'Failed to grade answer' },
      { status: 500 }
    );
  }
}
