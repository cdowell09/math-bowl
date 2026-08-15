import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestTutor } from './tutorService';
import type { TutorRequest } from '../types/tutor';

describe('requestTutor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts tutor requests to /api/tutor', async () => {
    const fetchSpy = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          mode: 'fallback',
          fallbackReason: 'Gemini request failed with 429',
          messages: [{ role: 'assistant', content: 'Let us try the first step.' }],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    vi.stubGlobal('fetch', fetchSpy);

    const request: TutorRequest = {
      grade: 2,
      problemType: 'Addition',
      problemDisplay: '9 + 4 =',
      correctAnswer: 13,
      studentAnswer: 12,
      messages: [],
    };

    const response = await requestTutor(request);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/tutor',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(response).toEqual({
      mode: 'fallback',
      fallbackReason: 'Gemini request failed with 429',
      messages: [{ role: 'assistant', content: 'Let us try the first step.' }],
    });
  });
});
