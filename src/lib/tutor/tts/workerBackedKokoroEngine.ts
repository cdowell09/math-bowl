import type {
  KokoroBackend,
  KokoroEngine,
  KokoroEnginePreloadOptions,
  KokoroProgressCallback,
  KokoroProgressEvent,
} from './kokoroEngine';

type WorkerRequest =
  | { id: number; type: 'preload' }
  | { id: number; type: 'generate-audio'; text: string }
  | { id: number; type: 'stop' };

type WorkerMessage =
  | { type: 'progress'; progress: KokoroProgressEvent }
  | { type: 'backend-selected'; backend: KokoroBackend }
  | { type: 'ready'; id: number; backend: KokoroBackend }
  | { type: 'audio'; id: number; audioBuffer: ArrayBuffer; mimeType?: string }
  | { type: 'error'; id: number; message: string };

type PendingRequest =
  | {
      type: 'preload';
      resolve: () => void;
      reject: (error: Error) => void;
    }
  | {
      type: 'generate-audio';
      resolve: (audio: Blob) => void;
      reject: (error: Error) => void;
    };

const STOPPED_ERROR_MESSAGE = 'Torch voice playback stopped';

interface WorkerBackedKokoroEngineOptions {
  createWorker?: () => Worker;
}

function defaultCreateWorker(): Worker {
  return new Worker(new URL('./kokoroWorker.ts', import.meta.url), { type: 'module' });
}

function toError(message: string): Error {
  return new Error(message || 'Torch TTS worker failed');
}

export function createWorkerBackedKokoroEngine(
  options: WorkerBackedKokoroEngineOptions = {}
): KokoroEngine {
  const createWorker = options.createWorker ?? defaultCreateWorker;

  let worker: Worker | null = null;
  let requestId = 0;
  let ready = false;
  let backend: KokoroBackend | null = null;
  let preloadPromise: Promise<void> | null = null;
  const progressListeners = new Set<KokoroProgressCallback>();
  const pendingRequests = new Map<number, PendingRequest>();

  const ensureWorker = () => {
    if (worker) {
      return worker;
    }

    worker = createWorker();
    worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      if (message.type === 'progress') {
        for (const listener of progressListeners) {
          listener(message.progress);
        }
        return;
      }

      if (message.type === 'backend-selected') {
        backend = message.backend;
        return;
      }

      if (message.type === 'ready') {
        backend = message.backend;
        ready = true;
      }

      const pending = pendingRequests.get('id' in message ? message.id : -1);
      if (!pending) {
        return;
      }

      pendingRequests.delete('id' in message ? message.id : -1);

      if (message.type === 'ready' && pending.type === 'preload') {
        pending.resolve();
        return;
      }

      if (message.type === 'audio' && pending.type === 'generate-audio') {
        pending.resolve(new Blob([message.audioBuffer], { type: message.mimeType ?? 'audio/wav' }));
        return;
      }

      if (message.type === 'error') {
        if (pending.type === 'preload') {
          preloadPromise = null;
        }
        pending.reject(toError(message.message));
      }
    });

    worker.addEventListener('error', () => {
      const error = toError('Torch voice worker crashed');
      for (const [id, pending] of pendingRequests) {
        pendingRequests.delete(id);
        pending.reject(error);
      }
      preloadPromise = null;
      ready = false;
    });

    return worker;
  };

  const postRequest = (request: WorkerRequest) => {
    ensureWorker().postMessage(request);
  };

  const stopWorkerGeneration = () => {
    requestId += 1;
    postRequest({ id: requestId, type: 'stop' });

    for (const [id, pending] of pendingRequests) {
      if (pending.type !== 'generate-audio') {
        continue;
      }

      pendingRequests.delete(id);
      pending.reject(toError(STOPPED_ERROR_MESSAGE));
    }
  };

  return {
    preload({ onProgress }: KokoroEnginePreloadOptions = {}) {
      if (ready) {
        return Promise.resolve();
      }

      if (onProgress) {
        progressListeners.add(onProgress);
      }

      if (preloadPromise) {
        return preloadPromise.finally(() => {
          if (onProgress) {
            progressListeners.delete(onProgress);
          }
        });
      }

      requestId += 1;
      const id = requestId;

      preloadPromise = new Promise<void>((resolve, reject) => {
        pendingRequests.set(id, {
          type: 'preload',
          resolve,
          reject,
        });
        postRequest({ id, type: 'preload' });
      });

      return preloadPromise.finally(() => {
        if (onProgress) {
          progressListeners.delete(onProgress);
        }
      });
    },
    isReady() {
      return ready;
    },
    getBackend() {
      return backend;
    },
    async generateAudio(text: string) {
      if (!ready) {
        await this.preload();
      }

      requestId += 1;
      const id = requestId;

      return new Promise<Blob>((resolve, reject) => {
        pendingRequests.set(id, {
          type: 'generate-audio',
          resolve,
          reject,
        });
        postRequest({ id, type: 'generate-audio', text });
      });
    },
    stop() {
      if (!worker) {
        return;
      }

      stopWorkerGeneration();
    },
  };
}
