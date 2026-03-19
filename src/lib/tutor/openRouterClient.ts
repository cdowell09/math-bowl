import type { TutorPrompt } from './prompt';
import type { TutorResponse } from '../../types/tutor';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'stepfun/step-3.5-flash:free';

export function createOpenRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://math-bowl.vercel.app',
    'X-Title': 'Math Bowl Tutor',
  };
}

export async function requestOpenRouterTutor(prompt: TutorPrompt): Promise<TutorResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenRouter API key');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: createOpenRouterHeaders(apiKey),
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.2,
    }),
  });

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
