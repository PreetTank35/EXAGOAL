import { NextResponse } from 'next/server';
import { formatGeminiMessages, getGeminiApiKey } from '@/lib/gemini';

export const maxDuration = 60;

const FALLBACK_OPENROUTER_MODELS = [
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-oss-20b:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-31b-it:free',
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const geminiKey = getGeminiApiKey();

    // ── 1. Priority: Google Gemini 2.5 Flash API ───────────────────────
    if (geminiKey) {
      try {
        const systemPrompt = `You are the ExaGoal AI Tutor, powered by Google Gemini 2.5 Flash. You are highly intelligent, encouraging, and focused on helping students understand concepts deeply. Keep your responses clear, well-structured, and helpful. When writing math formulas, always use LaTeX formatting with $ for inline math and $$ for block math.`;
        const { contents, systemInstruction } = formatGeminiMessages(messages, systemPrompt);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction,
              generationConfig: {
                temperature: 0.7,
              },
            }),
          }
        );

        if (geminiRes.ok && geminiRes.body) {
          const reader = geminiRes.body.getReader();
          const decoder = new TextDecoder('utf-8');
          const encoder = new TextEncoder();

          const stream = new ReadableStream({
            async start(controller) {
              let buffer = '';
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                      try {
                        const parsed = JSON.parse(trimmed.substring(6));
                        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (textChunk) {
                          const openAiChunk = JSON.stringify({
                            choices: [{ delta: { content: textChunk } }],
                          });
                          controller.enqueue(encoder.encode(`data: ${openAiChunk}\n\n`));
                        }
                      } catch {
                        // ignore chunk parsing errors
                      }
                    }
                  }
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              } catch (streamErr) {
                console.error('[Gemini Stream Error]', streamErr);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        console.warn('[AI Chat] Gemini 2.5 Flash direct stream failed, attempting OpenRouter fallback...');
      } catch (geminiErr) {
        console.warn('[AI Chat] Gemini 2.5 Flash exception, attempting OpenRouter fallback:', geminiErr);
      }
    }

    // ── 2. Fallback: OpenRouter Free Models Cascade ────────────────────
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim().replace(/['"\r\n]/g, '');

    if (!openRouterKey && !geminiKey) {
      return NextResponse.json(
        { error: 'Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured.' },
        { status: 500 }
      );
    }

    let lastError = '';

    if (openRouterKey) {
      for (const model of FALLBACK_OPENROUTER_MODELS) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
              'X-Title': 'ExaGoal AI Tutor',
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: 'system',
                  content: `You are the ExaGoal AI Tutor. You are highly intelligent, encouraging, and focused on helping students understand concepts deeply. Keep your responses clear, well-structured, and helpful. When writing math formulas, use LaTeX formatting with $ for inline math and $$ for block math.`,
                },
                ...messages,
              ],
              temperature: 0.7,
              stream: true,
            }),
          });

          if (response.ok && response.body) {
            return new Response(response.body, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              },
            });
          }

          const errorData = await response.json().catch(() => ({}));
          lastError = errorData.error?.message || response.statusText || `Model ${model} returned HTTP ${response.status}`;
          console.warn(`[AI Chat API] OpenRouter ${model} failed (${response.status}): ${lastError}. Trying next fallback...`);
        } catch (err: unknown) {
          lastError = err instanceof Error ? err.message : String(err);
          console.warn(`[AI Chat API] OpenRouter ${model} connection error: ${lastError}. Trying next fallback...`);
        }
      }
    }

    // All providers failed - stream a helpful notice
    const fallbackNotice = `⚠️ **AI Service Notice**: AI services are currently busy (${lastError || 'Service temporarily unavailable'}). Please try again in a moment.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunk = JSON.stringify({
          choices: [{ delta: { content: fallbackNotice } }],
        });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Streaming Chat API Error:', err);
    return NextResponse.json(
      { error: err.message || 'An internal error occurred while processing the chat.' },
      { status: 500 }
    );
  }
}
