import type { TutorPrompt } from './prompt.js';
import type { TutorResponse } from '../../types/tutor';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.1-flash-lite-preview';
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

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? getGeminiTimeoutMs();
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutToken = Symbol('gemini-timeout');

  try {
    const result = await Promise.race([
      fetchImpl(`${GEMINI_URL}/${getGeminiModel()}:generateContent`, {
        method: 'POST',
        headers: createGeminiHeaders(apiKey),
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: prompt.system }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt.user }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }),
      new Promise<Response | typeof timeoutToken>((resolve) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          resolve(timeoutToken);
        }, timeoutMs);
      }),
    ]);

    if (result === timeoutToken) {
      throw new Error('Gemini request timed out');
    }

    const response = result;
    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() ?? '';
    if (!content) {
      throw new Error('Gemini returned an empty response');
    }

    return normalizeTutorResponse(content);
  } catch (error) {
    if (error instanceof Error && error.message === 'Gemini request timed out') {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new Error('Gemini request timed out');
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function normalizeTutorResponse(content: string): TutorResponse {
  return {
    summary: content,
    hint: null,
    nextQuestion: null,
    workedExample: null,
    mode: 'live',
    fallbackReason: null,
    messages: [
      {
        role: 'assistant',
        content,
      },
    ],
  };
}
