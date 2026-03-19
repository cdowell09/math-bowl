import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOpenRouterHeaders,
  getOpenRouterModel,
  getOpenRouterTimeoutMs,
  requestOpenRouterTutor,
} from './openRouterClient';

describe('createOpenRouterHeaders', () => {
  it('creates the expected auth headers', () => {
    expect(createOpenRouterHeaders('test-key')).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer test-key',
        'Content-Type': 'application/json',
      })
    );
  });
});

describe('getOpenRouterModel', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the free tutor model', () => {
    expect(getOpenRouterModel()).toBe('stepfun/step-3.5-flash:free');
  });

  it('allows a model override for deployment flexibility', () => {
    vi.stubEnv('OPENROUTER_MODEL', 'openai/gpt-4.1-mini');
    expect(getOpenRouterModel()).toBe('openai/gpt-4.1-mini');
  });
});

describe('getOpenRouterTimeoutMs', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to a longer timeout for free-model latency', () => {
    expect(getOpenRouterTimeoutMs()).toBe(20000);
  });

  it('allows an environment override', () => {
    vi.stubEnv('OPENROUTER_TIMEOUT_MS', '12000');
    expect(getOpenRouterTimeoutMs()).toBe(12000);
  });
});

describe('requestOpenRouterTutor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('times out stalled provider calls', async () => {
    vi.useFakeTimers();
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');

    const fetchImpl = vi.fn(() => new Promise<Response>(() => {}));

    const promise = requestOpenRouterTutor(
      { system: 'system', user: 'user' },
      { timeoutMs: 10, fetchImpl: fetchImpl as typeof fetch }
    );

    const assertion = expect(promise).rejects.toThrow('OpenRouter request timed out');
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
  });
});
