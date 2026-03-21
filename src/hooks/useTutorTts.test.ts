import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TutorMessage } from '../types/tutor';
import { useTutorTts } from './useTutorTts';

function makeMessages(): TutorMessage[] {
  return [
    { role: 'user', content: 'I got stuck.' },
    { role: 'assistant', content: '## First hint' },
    { role: 'assistant', content: 'Try `skip-counting` by **5**.' },
  ];
}

function makeBlob() {
  return new Blob(['audio'], { type: 'audio/wav' });
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('useTutorTts', () => {
  it('starts preloading when enabled and exposes progress text', async () => {
    let ready = false;
    let progressListener: ((event: { status?: string; progress?: number; file?: string }) => void) | undefined;
    const deferred = createDeferred<void>();
    const preload = vi.fn(async ({ onProgress } = {}) => {
      progressListener = onProgress;
      await deferred.promise;
      ready = true;
    });
    const engine = {
      isReady: vi.fn(() => ready),
      getBackend: vi.fn(() => (ready ? 'wasm' as const : null)),
      preload,
      generateAudio: vi.fn(async () => makeBlob()),
      stop: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTutorTts({
        enabled: true,
        messages: [{ role: 'assistant', content: 'Read me first.' }],
        engine,
      })
    );

    await waitFor(() => {
      expect(preload).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(result.current.statusMessage).toBe('Preparing Torch voice...');
    });

    act(() => {
      progressListener?.({
        status: 'downloading',
        progress: 0.37,
        file: 'model.onnx',
      });
    });

    expect(result.current.statusMessage).toBe('Downloading Torch voice... 37%');

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(result.current.isKokoroReady).toBe(true);
    });
    expect(result.current.kokoroBackend).toBe('wasm');
    expect(result.current.statusMessage).toBe('Torch voice ready on WASM.');
  });

  it('plays the latest assistant message and falls back when Kokoro fails', async () => {
    const engine = {
      isReady: vi.fn(() => true),
      getBackend: vi.fn(() => 'wasm' as const),
      preload: vi.fn(async () => undefined),
      generateAudio: vi.fn(async () => {
        throw new Error('Kokoro failed');
      }),
      stop: vi.fn(),
    };
    const playback = {
      play: vi.fn(async () => undefined),
      stop: vi.fn(),
    };
    const browserSpeech = {
      supported: true,
      speak: vi.fn(async () => undefined),
      stop: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTutorTts({
        enabled: true,
        messages: makeMessages(),
        engine,
        browserSpeech,
        createPlayback: () => playback,
      })
    );

    await act(async () => {
      await result.current.playLatestAssistantMessage();
    });

    expect(engine.generateAudio).toHaveBeenCalledWith('Try skip-counting by 5.');
    expect(browserSpeech.speak).toHaveBeenCalledWith('Try skip-counting by 5.');
    expect(playback.play).not.toHaveBeenCalled();
  });

  it('stops playback when the active session key changes', async () => {
    const deferred = createDeferred<void>();
    const playback = {
      play: vi.fn(async () => deferred.promise),
      stop: vi.fn(),
    };
    const engine = {
      isReady: vi.fn(() => true),
      getBackend: vi.fn(() => 'wasm' as const),
      preload: vi.fn(async () => undefined),
      generateAudio: vi.fn(async () => makeBlob()),
      stop: vi.fn(),
    };
    const browserSpeech = {
      supported: true,
      speak: vi.fn(async () => undefined),
      stop: vi.fn(),
    };

    const { result, rerender } = renderHook(
      ({ sessionKey }) =>
        useTutorTts({
          enabled: true,
          sessionKey,
          messages: [{ role: 'assistant', content: 'Read me aloud.' }],
          engine,
          browserSpeech,
          createPlayback: () => playback,
        }),
      { initialProps: { sessionKey: 'one' } }
    );

    await act(async () => {
      void result.current.playLatestAssistantMessage();
    });

    await waitFor(() => {
      expect(playback.play).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      rerender({ sessionKey: 'two' });
    });

    await waitFor(() => {
      expect(playback.stop).toHaveBeenCalled();
    });
  });

  it('uses the device voice immediately while Kokoro warms up in the background', async () => {
    const deferred = createDeferred<void>();
    const playback = {
      play: vi.fn(async () => undefined),
      stop: vi.fn(),
    };
    const engine = {
      isReady: vi.fn(() => false),
      getBackend: vi.fn<() => 'wasm' | null>(() => null),
      preload: vi.fn(async () => {
        await deferred.promise;
      }),
      generateAudio: vi.fn(async () => makeBlob()),
      stop: vi.fn(),
    };
    const browserSpeech = {
      supported: true,
      speak: vi.fn(async () => undefined),
      stop: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTutorTts({
        enabled: true,
        messages: [{ role: 'assistant', content: 'Read me first.' }],
        engine,
        browserSpeech,
        createPlayback: () => playback,
      })
    );

    await waitFor(() => {
      expect(engine.preload).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      await result.current.playLatestAssistantMessage();
    });

    expect(browserSpeech.speak).toHaveBeenCalledWith('Read me first.');
    expect(engine.generateAudio).not.toHaveBeenCalled();
    expect(result.current.statusMessage).toBe('Preparing Torch voice...');

    engine.isReady.mockImplementation(() => true);
    engine.getBackend.mockImplementation(() => 'wasm');

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await waitFor(() => {
      expect(result.current.isKokoroReady).toBe(true);
      expect(result.current.statusMessage).toBe('Torch voice ready on WASM.');
    });
    expect(result.current.isUsingFallbackVoice).toBe(false);

    await act(async () => {
      await result.current.playLatestAssistantMessage();
    });

    expect(engine.generateAudio).toHaveBeenCalledWith('Read me first.');
    expect(playback.play).toHaveBeenCalledTimes(1);
    expect(browserSpeech.speak).toHaveBeenCalledTimes(1);
  });
});
