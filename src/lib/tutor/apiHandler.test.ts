import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TutorRequest } from '../../types/tutor';

const mocks = vi.hoisted(() => ({
  validateTutorRequest: vi.fn(),
  requestGeminiTutor: vi.fn(),
}));

vi.mock('./validation.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./validation.js')>()),
  validateTutorRequest: mocks.validateTutorRequest,
}));
vi.mock('./geminiClient.js', () => ({
  requestGeminiTutor: mocks.requestGeminiTutor,
}));

import handler from '../../../api/tutor';

function createResponse() {
  const response = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

const request: TutorRequest = {
  grade: 1,
  problemType: 'Addition',
  problemDisplay: '5 + 3 =',
  correctAnswer: 8,
  studentAnswer: 6,
  messages: [],
};

describe('tutor API handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates once before either provider or fallback handling', async () => {
    const invalidResponse = createResponse();
    mocks.validateTutorRequest.mockImplementationOnce(() => {
      throw new Error('Invalid tutor request');
    });

    await handler({ method: 'POST', body: {} }, invalidResponse);

    expect(mocks.validateTutorRequest).toHaveBeenCalledTimes(1);
    expect(mocks.requestGeminiTutor).not.toHaveBeenCalled();
    expect(invalidResponse.status).toHaveBeenCalledWith(400);

    const fallbackResponse = createResponse();
    mocks.validateTutorRequest.mockReturnValueOnce(request);
    mocks.requestGeminiTutor.mockRejectedValueOnce(new Error('provider unavailable'));

    await handler({ method: 'POST', body: request }, fallbackResponse);

    expect(mocks.validateTutorRequest).toHaveBeenCalledTimes(2);
    expect(fallbackResponse.status).toHaveBeenCalledWith(200);
    expect(fallbackResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'fallback', fallbackReason: 'provider unavailable' })
    );
  });
});
