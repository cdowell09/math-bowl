import type { TutorPrompt } from './prompt';
import type { TutorResponse } from '../../types/tutor';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_OPENROUTER_MODEL = 'stepfun/step-3.5-flash:free';
const DEFAULT_TIMEOUT_MS = 8000;

export function createOpenRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://math-bowl.vercel.app',
    'X-Title': 'Math Bowl Tutor',
  };
}

export function getOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL?.trim();
  return model ? model : DEFAULT_OPENROUTER_MODEL;
}

export async function requestOpenRouterTutor(
  prompt: TutorPrompt,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}
): Promise<TutorResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenRouter API key');
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutToken = Symbol('openrouter-timeout');

  try {
    const result = await Promise.race([
      fetchImpl(OPENROUTER_URL, {
        method: 'POST',
        headers: createOpenRouterHeaders(apiKey),
        signal: controller.signal,
        body: JSON.stringify({
          model: getOpenRouterModel(),
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          temperature: 0.2,
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
      throw new Error('OpenRouter request timed out');
    }

    const response = result;
    if (!response.ok) {
      throw new Error(`OpenRouter request failed with ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content ?? '';
    if (!content) {
      throw new Error('OpenRouter returned an empty response');
    }

    return normalizeTutorResponse(content);
  } catch (error) {
    if (error instanceof Error && error.message === 'OpenRouter request timed out') {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new Error('OpenRouter request timed out');
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function normalizeTutorResponse(content: string): TutorResponse {
  return {
    summary: content.trim(),
    hint: null,
    nextQuestion: null,
    workedExample: null,
    messages: [
      {
        role: 'assistant',
        content: content.trim(),
      },
    ],
  };
}
