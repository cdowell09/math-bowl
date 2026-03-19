import { buildTutorFallback } from '../src/lib/tutor/fallback';
import { buildTutorPrompt } from '../src/lib/tutor/prompt';
import { requestOpenRouterTutor } from '../src/lib/tutor/openRouterClient';
import { validateTutorRequest } from '../src/lib/tutor/validation';

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
    const response = await requestOpenRouterTutor(prompt);
    res.status(200).json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tutor request failed';

    if (message.startsWith('Invalid')) {
      res.status(400).json({ error: message });
      return;
    }

    try {
      const request = validateTutorRequest(req.body);
      res.status(200).json(buildTutorFallback(request));
    } catch {
      res.status(200).json(
        buildTutorFallback({
          grade: 1,
          problemType: 'Unknown',
          problemDisplay: 'Unknown problem',
          correctAnswer: 0,
          studentAnswer: null,
          messages: [],
        })
      );
    }
  }
}
