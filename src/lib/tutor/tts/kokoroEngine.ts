export const DEFAULT_KOKORO_MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
export const DEFAULT_KOKORO_DTYPE = 'q8';
export const DEFAULT_KOKORO_DEVICE = null;
export const DEFAULT_KOKORO_VOICE = 'af_heart';

type KokoroDtype = 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16';
type KokoroDevice = 'wasm' | 'webgpu' | 'cpu' | null;
export type KokoroBackend = 'wasm' | 'webgpu' | 'cpu';

export interface KokoroProgressEvent {
  progress?: number;
  status?: string;
  file?: string;
  loaded?: number;
  total?: number;
  [key: string]: unknown;
}

export type KokoroProgressCallback = (event: KokoroProgressEvent) => void;

interface KokoroModule {
  KokoroTTS?: {
    from_pretrained: (
      modelId: string,
      options: {
        dtype?: KokoroDtype;
        device?: KokoroDevice;
        progress_callback?: KokoroProgressCallback;
      }
    ) => Promise<KokoroRuntime>;
  };
  default?: {
    KokoroTTS?: KokoroModule['KokoroTTS'];
  };
}

interface KokoroRuntime {
  generate: (text: string, options: { voice: string }) => Promise<KokoroAudio>;
}

interface KokoroAudio {
  toBlob?: () => Blob | Promise<Blob>;
  toWav?: () => ArrayBuffer | Uint8Array | Blob | Promise<ArrayBuffer | Uint8Array | Blob>;
}

export interface KokoroEngineOptions {
  loadKokoro?: () => Promise<KokoroModule>;
  modelId?: string;
  dtype?: KokoroDtype;
  device?: KokoroDevice;
  voice?: string;
}

export interface KokoroEnginePreloadOptions {
  onProgress?: KokoroProgressCallback;
}

export interface KokoroEngine {
  preload: (options?: KokoroEnginePreloadOptions) => Promise<void>;
  isReady: () => boolean;
  getBackend: () => KokoroBackend | null;
  generateAudio: (text: string) => Promise<Blob>;
  stop: () => void;
}

async function defaultLoadKokoro(): Promise<KokoroModule> {
  return (await import('kokoro-js')) as unknown as KokoroModule;
}

function resolveBackendQueue(device: KokoroDevice): KokoroBackend[] {
  if (device === null) {
    return ['webgpu', 'wasm'];
  }

  return [device];
}

function resolveDtypeForBackend(backend: KokoroBackend, dtype: KokoroDtype): KokoroDtype {
  if (backend === 'webgpu') {
    return 'fp32';
  }

  return dtype;
}

interface ResolvedRuntime {
  runtime: KokoroRuntime;
  backend: KokoroBackend;
}

async function resolveRuntime(
  options: Required<Pick<KokoroEngineOptions, 'loadKokoro' | 'modelId' | 'dtype' | 'device'>>,
  progressCallback?: KokoroProgressCallback
): Promise<ResolvedRuntime> {
  const module = await options.loadKokoro();
  const kokoroTts = module.KokoroTTS ?? module.default?.KokoroTTS;

  if (!kokoroTts) {
    throw new Error('Kokoro TTS module is unavailable');
  }

  let lastError: unknown;

  for (const backend of resolveBackendQueue(options.device)) {
    try {
      const runtime = await kokoroTts.from_pretrained(options.modelId, {
        dtype: resolveDtypeForBackend(backend, options.dtype),
        device: backend,
        progress_callback: progressCallback,
      });

      return { runtime, backend };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Kokoro TTS initialization failed');
}

async function audioToBlob(audio: KokoroAudio): Promise<Blob> {
  if (typeof audio.toBlob === 'function') {
    return audio.toBlob();
  }

  if (typeof audio.toWav === 'function') {
    const wav = await audio.toWav();
    if (wav instanceof Blob) {
      return wav;
    }

    return new Blob([wav], { type: 'audio/wav' });
  }

  throw new Error('Kokoro audio result does not support blob conversion');
}

export function createKokoroEngine(options: KokoroEngineOptions = {}): KokoroEngine {
  const loadKokoro = options.loadKokoro ?? defaultLoadKokoro;
  const modelId = options.modelId ?? DEFAULT_KOKORO_MODEL_ID;
  const dtype = options.dtype ?? DEFAULT_KOKORO_DTYPE;
  const device = options.device ?? DEFAULT_KOKORO_DEVICE;
  const voice = options.voice ?? DEFAULT_KOKORO_VOICE;

  let runtimePromise: Promise<ResolvedRuntime> | null = null;
  let isReady = false;
  let backend: KokoroBackend | null = null;
  const progressListeners = new Set<KokoroProgressCallback>();

  const emitProgress = (progress: KokoroProgressEvent) => {
    for (const listener of progressListeners) {
      listener(progress);
    }
  };

  const getRuntime = () => {
    if (!runtimePromise) {
      runtimePromise = resolveRuntime(
        {
          loadKokoro,
          modelId,
          dtype,
          device,
        },
        emitProgress
      )
        .then((resolvedRuntime) => {
          isReady = true;
          backend = resolvedRuntime.backend;
          return resolvedRuntime;
        })
        .catch((error) => {
          runtimePromise = null;
          backend = null;
          isReady = false;
          throw error;
        });
    }

    return runtimePromise;
  };

  return {
    async preload(options?: KokoroEnginePreloadOptions): Promise<void> {
      const progressCallback = options?.onProgress;
      if (progressCallback) {
        progressListeners.add(progressCallback);
      }

      try {
        await getRuntime();
      } finally {
        if (progressCallback) {
          progressListeners.delete(progressCallback);
        }
      }
    },
    isReady() {
      return isReady;
    },
    getBackend() {
      return backend;
    },
    async generateAudio(text: string): Promise<Blob> {
      const resolvedRuntime = await getRuntime();
      const audio = await resolvedRuntime.runtime.generate(text, { voice });
      return audioToBlob(audio);
    },
    stop() {},
  };
}
