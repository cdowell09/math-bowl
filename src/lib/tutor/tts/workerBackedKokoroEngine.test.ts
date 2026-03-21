import { describe, expect, it, vi } from 'vitest';
import { createWorkerBackedKokoroEngine } from './workerBackedKokoroEngine';

class MockWorker {
  readonly postMessage = vi.fn();
  readonly terminate = vi.fn();

  private readonly listeners = new Map<string, Set<(event: MessageEvent) => void>>();

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    const set = this.listeners.get(type) ?? new Set<(event: MessageEvent) => void>();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: string, data: unknown) {
    const event = { data } as MessageEvent;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}

describe('createWorkerBackedKokoroEngine', () => {
  it('forwards preload progress and ready state through the worker boundary', async () => {
    const worker = new MockWorker();
    const onProgress = vi.fn();
    const engine = createWorkerBackedKokoroEngine({
      createWorker: () => worker as unknown as Worker,
    });

    const preloadPromise = engine.preload({ onProgress });

    expect(worker.postMessage).toHaveBeenCalledWith({
      id: 1,
      type: 'preload',
    });

    worker.emit('message', {
      type: 'progress',
      progress: { status: 'downloading', progress: 0.42 },
    });
    worker.emit('message', {
      type: 'backend-selected',
      backend: 'wasm',
    });
    worker.emit('message', {
      type: 'ready',
      id: 1,
      backend: 'wasm',
    });

    await preloadPromise;

    expect(onProgress).toHaveBeenCalledWith({
      status: 'downloading',
      progress: 0.42,
    });
    expect(engine.isReady()).toBe(true);
    expect(engine.getBackend()).toBe('wasm');
  });

  it('returns generated audio from the worker', async () => {
    const worker = new MockWorker();
    const engine = createWorkerBackedKokoroEngine({
      createWorker: () => worker as unknown as Worker,
    });

    const preloadPromise = engine.preload();
    worker.emit('message', {
      type: 'ready',
      id: 1,
      backend: 'webgpu',
    });
    await preloadPromise;

    const generatePromise = engine.generateAudio('Count by 5');

    expect(worker.postMessage).toHaveBeenLastCalledWith({
      id: 2,
      type: 'generate-audio',
      text: 'Count by 5',
    });

    const payload = new TextEncoder().encode('audio').buffer;
    worker.emit('message', {
      type: 'audio',
      id: 2,
      audioBuffer: payload,
      mimeType: 'audio/wav',
    });

    const audio = await generatePromise;

    expect(audio).toBeInstanceOf(Blob);
    await expect(audio.text()).resolves.toBe('audio');
  });

  it('rejects an in-flight generation when stopped', async () => {
    const worker = new MockWorker();
    const engine = createWorkerBackedKokoroEngine({
      createWorker: () => worker as unknown as Worker,
    });

    const preloadPromise = engine.preload();
    worker.emit('message', {
      type: 'ready',
      id: 1,
      backend: 'webgpu',
    });
    await preloadPromise;

    const generatePromise = engine.generateAudio('Count by 5');
    engine.stop();

    expect(worker.postMessage).toHaveBeenLastCalledWith({
      id: 3,
      type: 'stop',
    });
    await expect(generatePromise).rejects.toThrow('Torch voice playback stopped');
  });
});
