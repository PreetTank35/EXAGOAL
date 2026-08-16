// ============================================================
// Google Gemini API Client — Direct High-Speed Integration
// Models: gemini-2.5-flash, gemini-2.0-flash, etc.
// ============================================================

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const getGeminiApiKey = () =>
  (process.env.GEMINI_API_KEY || '').trim().replace(/['"\r\n]/g, '');

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/** Format chat messages into Gemini API content structures */
export function formatGeminiMessages(
  messages: { role: string; content: string }[],
  systemInstruction?: string
): { contents: GeminiContent[]; systemInstruction?: { parts: { text: string }[] } } {
  const contents: GeminiContent[] = [];

  for (const m of messages) {
    if (m.role === 'system') continue;
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    });
  }

  // Ensure contents starts with user
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  return {
    contents,
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
  };
}

/** Direct content generation using Google Gemini REST API */
export async function generateGeminiContent(
  contents: GeminiContent[],
  options: {
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    model?: string;
  } = {}
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const model = options.model || GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    },
  };

  if (options.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg = errorData.error?.message || `Gemini API returned HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');

  return text;
}
