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

  let request;
  try {
    request = validateTutorRequest(req.body);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid tutor request',
    });
    return;
  }

  try {
    res.status(200).json(await requestGeminiTutor(buildTutorPrompt(request)));
  } catch (error) {
    res.status(200).json({
      ...buildTutorFallback(request),
      fallbackReason: error instanceof Error ? error.message : 'Tutor request failed',
    });
  }
}
