import { NextResponse } from 'next/server';

export const maxDuration = 60; // Allow longer execution for huge models

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured.' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'ExaGoal AI Tutor',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        messages: [
          { role: 'system', content: `You are the ExaGoal AI Tutor, powered by Nvidia Nemotron. You are highly intelligent, encouraging, and focused on helping students understand concepts deeply. Keep your responses concise, well-structured, and friendly. When writing math formulas, always use LaTeX formatting with $ for inline math and $$ for block math.` },
          ...messages
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Upstream provider error' },
        { status: response.status }
      );
    }

    // Stream the raw Server-Sent Events straight back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Streaming Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal error occurred while processing the chat.' },
      { status: 500 }
    );
  }
}
