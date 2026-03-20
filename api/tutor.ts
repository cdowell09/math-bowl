import { buildTutorFallback } from '../src/lib/tutor/fallback.js';
import { requestGeminiTutor } from '../src/lib/tutor/geminiClient.js';
import { buildTutorPrompt } from '../src/lib/tutor/prompt.js';
import { validateTutorRequest } from '../src/lib/tutor/validation.js';

interface TutorApiRequest {
  method?: string;
  body: unknown;
}

interface TutorApiResponse {
  setHeader(name: string, value: string): void;
  status(code: number): TutorApiResponse;
  json(body: unknown): void;
}

export default async function handler(req: TutorApiRequest, res: TutorApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const request = validateTutorRequest(req.body);
    const prompt = buildTutorPrompt(request);
    const response = await requestGeminiTutor(prompt);
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tutor request failed';

    if (message.startsWith('Invalid')) {
      res.status(400).json({ error: message });
      return;
    }

    try {
      const request = validateTutorRequest(req.body);
      const fallback = buildTutorFallback(request);
      res.status(200).json({
        ...fallback,
        mode: 'fallback',
        fallbackReason: message,
      });
    } catch {
      res.status(200).json(
        {
          ...buildTutorFallback({
          grade: 1,
          problemType: 'Unknown',
          problemDisplay: 'Unknown problem',
          correctAnswer: 0,
          studentAnswer: null,
          messages: [],
          }),
          mode: 'fallback',
          fallbackReason: message,
        }
      );
    }
  }
}
