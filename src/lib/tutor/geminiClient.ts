import type { TutorPrompt } from './prompt.js';
import type { TutorResponse } from '../../types/tutor';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
const DEFAULT_GEMINI_THINKING_LEVEL = 'low';
const DEFAULT_TIMEOUT_MS = 12000;

export function createGeminiHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey,
  };
}

export function getGeminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim();
  return model ? model : DEFAULT_GEMINI_MODEL;
}

export function getGeminiTimeoutMs(): number {
  const raw = process.env.GEMINI_TIMEOUT_MS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export async function requestGeminiTutor(
  prompt: TutorPrompt,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<TutorResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key');
  }

  const signal = AbortSignal.timeout(options.timeoutMs ?? getGeminiTimeoutMs());

  try {
    const response = await (options.fetchImpl ?? fetch)(
      `${GEMINI_URL}/${getGeminiModel()}:generateContent`,
      {
        method: 'POST',
        headers: createGeminiHeaders(apiKey),
        signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt.system }] },
          contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
          generationConfig: {
            temperature: 0.2,
            thinkingConfig: { thinkingLevel: DEFAULT_GEMINI_THINKING_LEVEL },
          },
        }),
      }
    );

    if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
    if (!content) throw new Error('Gemini returned an empty response');

    return normalizeTutorResponse(content);
  } catch (error) {
    if (signal.aborted) throw new Error('Gemini request timed out');
    throw error;
  }
}

function normalizeTutorResponse(content: string): TutorResponse {
  return {
    mode: 'live',
    fallbackReason: null,
    messages: [{ role: 'assistant', content }],
  };
}
