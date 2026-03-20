import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createGeminiHeaders,
  getGeminiModel,
  getGeminiTimeoutMs,
  requestGeminiTutor,
} from './geminiClient';

describe('createGeminiHeaders', () => {
  it('creates the expected auth headers', () => {
    expect(createGeminiHeaders('test-key')).toEqual(
      expect.objectContaining({
        'Content-Type': 'application/json',
        'x-goog-api-key': 'test-key',
      })
    );
  });
});

describe('getGeminiModel', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the flash-lite tutor model', () => {
    expect(getGeminiModel()).toBe('gemini-3.1-flash-lite-preview');
  });

  it('allows a model override for deployment flexibility', () => {
    vi.stubEnv('GEMINI_MODEL', 'gemini-3-flash-preview');
    expect(getGeminiModel()).toBe('gemini-3-flash-preview');
  });
});

describe('getGeminiTimeoutMs', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to a tutor-friendly timeout', () => {
    expect(getGeminiTimeoutMs()).toBe(12000);
  });

  it('allows an environment override', () => {
    vi.stubEnv('GEMINI_TIMEOUT_MS', '9000');
    expect(getGeminiTimeoutMs()).toBe(9000);
  });
});

describe('requestGeminiTutor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('normalizes a Gemini text response into tutor shape', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');

    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'First sentence. ' },
                  { text: 'Second sentence.' },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(
      requestGeminiTutor(
        { system: 'system', user: 'user' },
        { fetchImpl: fetchImpl as typeof fetch }
      )
    ).resolves.toEqual({
      summary: 'First sentence. Second sentence.',
      hint: null,
      nextQuestion: null,
      workedExample: null,
      mode: 'live',
      fallbackReason: null,
      messages: [{ role: 'assistant', content: 'First sentence. Second sentence.' }],
    });
  });

  it('times out stalled provider calls', async () => {
    vi.useFakeTimers();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');

    const fetchImpl = vi.fn(() => new Promise<Response>(() => {}));

    const promise = requestGeminiTutor(
      { system: 'system', user: 'user' },
      { timeoutMs: 10, fetchImpl: fetchImpl as typeof fetch }
    );

    const assertion = expect(promise).rejects.toThrow('Gemini request timed out');
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
  });
});
