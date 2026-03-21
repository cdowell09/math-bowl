import { describe, expect, it, vi } from 'vitest';
import { createKokoroEngine, DEFAULT_KOKORO_DTYPE, DEFAULT_KOKORO_MODEL_ID, DEFAULT_KOKORO_VOICE } from './kokoroEngine';

function createBlob() {
  return new Blob(['audio'], { type: 'audio/wav' });
}

describe('createKokoroEngine', () => {
  it('loads Kokoro lazily and prefers webgpu with the fp32 dtype', async () => {
    const generate = vi.fn(async () => ({
      toBlob: vi.fn(async () => createBlob()),
    }));
    const fromPretrained = vi.fn(async () => ({
      generate,
    }));
    const loadKokoro = vi.fn(async () => ({
      KokoroTTS: {
        from_pretrained: fromPretrained,
      },
    }));

    const engine = createKokoroEngine({ loadKokoro });

    expect(loadKokoro).not.toHaveBeenCalled();
    expect(engine.isReady()).toBe(false);
    expect(engine.getBackend()).toBeNull();

    const audio = await engine.generateAudio('Count by 5');

    expect(loadKokoro).toHaveBeenCalledTimes(1);
    expect(fromPretrained).toHaveBeenCalledWith(DEFAULT_KOKORO_MODEL_ID, {
      dtype: 'fp32',
      device: 'webgpu',
      progress_callback: expect.any(Function),
    });
    expect(generate).toHaveBeenCalledWith('Count by 5', { voice: DEFAULT_KOKORO_VOICE });
    expect(engine.isReady()).toBe(true);
    expect(engine.getBackend()).toBe('webgpu');
    expect(audio).toBeInstanceOf(Blob);
    await expect(audio.text()).resolves.toBe('audio');
  });

  it('reuses the loaded model for later requests', async () => {
    const generate = vi.fn(async () => ({
      toBlob: vi.fn(async () => createBlob()),
    }));
    const fromPretrained = vi.fn(async () => ({
      generate,
    }));
    const loadKokoro = vi.fn(async () => ({
      KokoroTTS: {
        from_pretrained: fromPretrained,
      },
    }));

    const engine = createKokoroEngine({ loadKokoro });

    await engine.generateAudio('First');
    await engine.generateAudio('Second');

    expect(loadKokoro).toHaveBeenCalledTimes(1);
    expect(fromPretrained).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenNthCalledWith(1, 'First', { voice: DEFAULT_KOKORO_VOICE });
    expect(generate).toHaveBeenNthCalledWith(2, 'Second', { voice: DEFAULT_KOKORO_VOICE });
  });

  it('can warm the model up before the first playback request and report progress', async () => {
    const onProgress = vi.fn();
    const fromPretrained = vi.fn(async (_modelId, options) => {
      options.progress_callback?.({
        status: 'downloading',
        progress: 0.5,
      });

      return {
        generate: vi.fn(async () => ({
          toBlob: vi.fn(async () => createBlob()),
        })),
      };
    });
    const loadKokoro = vi.fn(async () => ({
      KokoroTTS: {
        from_pretrained: fromPretrained,
      },
    }));

    const engine = createKokoroEngine({ loadKokoro });

    expect(engine.isReady()).toBe(false);
    expect(engine.getBackend()).toBeNull();

    await engine.preload({ onProgress });

    expect(loadKokoro).toHaveBeenCalledTimes(1);
    expect(fromPretrained).toHaveBeenCalledTimes(1);
    expect(fromPretrained).toHaveBeenCalledWith(DEFAULT_KOKORO_MODEL_ID, {
      dtype: 'fp32',
      device: 'webgpu',
      progress_callback: expect.any(Function),
    });
    expect(engine.isReady()).toBe(true);
    expect(engine.getBackend()).toBe('webgpu');
    expect(onProgress).toHaveBeenCalledWith({
      status: 'downloading',
      progress: 0.5,
    });
  });

  it('tries webgpu first and falls back to wasm when webgpu initialization fails', async () => {
    const wasmGenerate = vi.fn(async () => ({
      toBlob: vi.fn(async () => createBlob()),
    }));
    const fromPretrained = vi
      .fn()
      .mockRejectedValueOnce(new Error('webgpu unavailable'))
      .mockResolvedValueOnce({
        generate: wasmGenerate,
      });
    const loadKokoro = vi.fn(async () => ({
      KokoroTTS: {
        from_pretrained: fromPretrained,
      },
    }));

    const engine = createKokoroEngine({ loadKokoro });

    await engine.preload();

    expect(fromPretrained).toHaveBeenNthCalledWith(1, DEFAULT_KOKORO_MODEL_ID, {
      dtype: 'fp32',
      device: 'webgpu',
      progress_callback: expect.any(Function),
    });
    expect(fromPretrained).toHaveBeenNthCalledWith(2, DEFAULT_KOKORO_MODEL_ID, {
      dtype: DEFAULT_KOKORO_DTYPE,
      device: 'wasm',
      progress_callback: expect.any(Function),
    });
    expect(engine.isReady()).toBe(true);
    expect(engine.getBackend()).toBe('wasm');

    const audio = await engine.generateAudio('Try again');

    expect(wasmGenerate).toHaveBeenCalledWith('Try again', { voice: DEFAULT_KOKORO_VOICE });
    await expect(audio.text()).resolves.toBe('audio');
  });

  it('does not keep stale progress listeners across preload attempts', async () => {
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    const fromPretrained = vi
      .fn()
      .mockImplementationOnce(async (_modelId, options) => {
        options.progress_callback?.({ status: 'downloading', progress: 0.25 });
        throw new Error('first preload failed');
      })
      .mockImplementationOnce(async (_modelId, options) => {
        options.progress_callback?.({ status: 'downloading', progress: 0.75 });
        return {
          generate: vi.fn(async () => ({
            toBlob: vi.fn(async () => createBlob()),
          })),
        };
      });
    const loadKokoro = vi.fn(async () => ({
      KokoroTTS: {
        from_pretrained: fromPretrained,
      },
    }));

    const engine = createKokoroEngine({ loadKokoro, device: 'wasm' });

    await expect(engine.preload({ onProgress: firstListener })).rejects.toThrow('first preload failed');
    await engine.preload({ onProgress: secondListener });

    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledWith({
      status: 'downloading',
      progress: 0.75,
    });
  });
});
