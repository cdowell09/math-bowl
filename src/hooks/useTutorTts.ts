import { useCallback, useEffect, useRef, useState } from 'react';
import type { TutorMessage } from '../types/tutor';
import { createKokoroEngine, type KokoroBackend, type KokoroEngine, type KokoroProgressEvent } from '../lib/tutor/tts/kokoroEngine';
import { createWorkerBackedKokoroEngine } from '../lib/tutor/tts/workerBackedKokoroEngine';
import { sanitizeTutorSpeech } from '../lib/tutor/tts/sanitizeTutorSpeech';

export type TutorTtsStatus = 'disabled' | 'idle' | 'loading' | 'speaking' | 'error';

export interface TutorTtsPlaybackController {
  play: (audio: Blob) => Promise<void>;
  stop: () => void;
}

export interface TutorSpeechController {
  supported: boolean;
  speak: (content: string) => Promise<void>;
  stop: () => void;
}

export interface UseTutorTtsOptions {
  enabled?: boolean;
  sessionKey?: string;
  messages: TutorMessage[];
  engine?: KokoroEngine;
  browserSpeech?: TutorSpeechController;
  createPlayback?: () => TutorTtsPlaybackController;
}

export interface UseTutorTtsResult {
  status: TutorTtsStatus;
  error: string | null;
  statusMessage: string | null;
  isLoadingVoice: boolean;
  isSpeaking: boolean;
  isUsingFallbackVoice: boolean;
  isKokoroReady: boolean;
  kokoroBackend: KokoroBackend | null;
  latestAssistantMessage: string | null;
  canPlayLatestAssistantMessage: boolean;
  playLatestAssistantMessage: () => Promise<void>;
  stopPlayback: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return 'Torch TTS failed';
}

function getLatestAssistantMessage(messages: TutorMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'assistant' && message.content.trim() !== '') {
      return message.content;
    }
  }

  return null;
}

function formatBackendLabel(backend: KokoroBackend | null): string {
  if (backend === 'webgpu') {
    return 'WebGPU';
  }

  if (backend === 'wasm') {
    return 'WASM';
  }

  return 'CPU';
}

function formatProgressPercent(progress: KokoroProgressEvent): string | null {
  if (typeof progress.progress === 'number' && Number.isFinite(progress.progress)) {
    const normalizedProgress = progress.progress > 1 ? progress.progress / 100 : progress.progress;
    return `${Math.round(normalizedProgress * 100)}%`;
  }

  if (
    typeof progress.loaded === 'number' &&
    typeof progress.total === 'number' &&
    progress.total > 0 &&
    Number.isFinite(progress.loaded) &&
    Number.isFinite(progress.total)
  ) {
    return `${Math.round((progress.loaded / progress.total) * 100)}%`;
  }

  return null;
}

function getProgressStatusMessage(progress: KokoroProgressEvent): string {
  const status = typeof progress.status === 'string' ? progress.status.toLowerCase() : '';
  const progressPercent = formatProgressPercent(progress);
  const isDownloadLike =
    typeof progress.file === 'string' ||
    typeof progress.loaded === 'number' ||
    typeof progress.total === 'number' ||
    status.includes('download') ||
    status.includes('fetch') ||
    status.includes('load');

  if (isDownloadLike) {
    return progressPercent ? `Downloading Torch voice... ${progressPercent}` : 'Downloading Torch voice...';
  }

  return progressPercent ? `Preparing Torch voice... ${progressPercent}` : 'Preparing Torch voice...';
}

function getReadyStatusMessage(backend: KokoroBackend | null): string {
  if (!backend) {
    return 'Torch voice ready.';
  }

  return `Torch voice ready on ${formatBackendLabel(backend)}.`;
}

function getUnavailableStatusMessage(): string {
  return 'Torch voice could not be prepared. Using your device voice instead.';
}

function createBrowserSpeechController(): TutorSpeechController {
  if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
    return {
      supported: false,
      async speak() {
        throw new Error('Browser speech is unavailable');
      },
      stop() {},
    };
  }

  let currentUtterance: SpeechSynthesisUtterance | null = null;
  let currentResolver: (() => void) | null = null;

  const clearCurrent = () => {
    currentUtterance = null;
    currentResolver = null;
  };

  return {
    supported: true,
    speak(content: string) {
      return new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(content);
        currentUtterance = utterance;
        currentResolver = resolve;

        utterance.onend = () => {
          const finish = currentResolver;
          clearCurrent();
          finish?.();
        };

        utterance.onerror = () => {
          clearCurrent();
          reject(new Error('Browser speech failed'));
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      });
    },
    stop() {
      const finish = currentResolver;
      clearCurrent();
      window.speechSynthesis.cancel();
      finish?.();
      void currentUtterance;
    },
  };
}

function createHtmlAudioPlayback(): TutorTtsPlaybackController {
  let currentAudio: HTMLAudioElement | null = null;
  let currentObjectUrl: string | null = null;
  let currentResolver: (() => void) | null = null;
  let currentRejecter: ((error: Error) => void) | null = null;

  const cleanup = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.load();
      currentAudio = null;
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };

  const settle = () => {
    const resolve = currentResolver;
    currentResolver = null;
    currentRejecter = null;
    cleanup();
    resolve?.();
  };

  const fail = (error: Error) => {
    const reject = currentRejecter;
    currentResolver = null;
    currentRejecter = null;
    cleanup();
    reject?.(error);
  };

  return {
    play(audio: Blob) {
      this.stop();

      return new Promise<void>((resolve, reject) => {
        if (typeof Audio === 'undefined' || typeof URL === 'undefined') {
          reject(new Error('Audio playback is unavailable'));
          return;
        }

        currentResolver = resolve;
        currentRejecter = reject;

        const player = new Audio();
        const objectUrl = URL.createObjectURL(audio);

        currentAudio = player;
        currentObjectUrl = objectUrl;

        player.onended = settle;
        player.onerror = () => fail(new Error('Audio playback failed'));
        player.src = objectUrl;

        void player.play().catch(() => fail(new Error('Audio playback failed')));
      });
    },
    stop() {
      const resolve = currentResolver;
      currentResolver = null;
      currentRejecter = null;
      cleanup();
      resolve?.();
    },
  };
}

export function useTutorTts({
  enabled = false,
  sessionKey,
  messages,
  engine,
  browserSpeech,
  createPlayback,
}: UseTutorTtsOptions): UseTutorTtsResult {
  const [status, setStatus] = useState<TutorTtsStatus>(enabled ? 'idle' : 'disabled');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUsingFallbackVoice, setIsUsingFallbackVoice] = useState(false);
  const [isKokoroReady, setIsKokoroReady] = useState(() => (engine?.isReady ? engine.isReady() : false));
  const [kokoroBackend, setKokoroBackend] = useState<KokoroBackend | null>(() => (engine?.getBackend ? engine.getBackend() : null));

  const engineRef = useRef<KokoroEngine | null>(engine ?? null);
  const browserSpeechRef = useRef<TutorSpeechController | null>(browserSpeech ?? null);
  const playbackFactoryRef = useRef<() => TutorTtsPlaybackController>(createPlayback ?? createHtmlAudioPlayback);
  const activePlaybackRef = useRef<TutorTtsPlaybackController | TutorSpeechController | null>(null);
  const playbackTokenRef = useRef(0);
  const warmupPromiseRef = useRef<Promise<void> | null>(null);

  if (engineRef.current === null && engine !== undefined) {
    engineRef.current = engine;
  }

  if (browserSpeechRef.current === null && browserSpeech !== undefined) {
    browserSpeechRef.current = browserSpeech;
  }

  if (playbackFactoryRef.current === createHtmlAudioPlayback && createPlayback !== undefined) {
    playbackFactoryRef.current = createPlayback;
  }

  const getEngine = () =>
    engineRef.current ??
    (engineRef.current = typeof Worker === 'undefined' ? createKokoroEngine() : createWorkerBackedKokoroEngine());
  const getBrowserSpeech = () => browserSpeechRef.current ?? (browserSpeechRef.current = createBrowserSpeechController());
  const getPlayback = () => playbackFactoryRef.current();

  const warmupEngine = useCallback(() => {
    if (warmupPromiseRef.current) {
      return warmupPromiseRef.current;
    }

    const nextEngine = getEngine();
    if (nextEngine.isReady()) {
      setIsKokoroReady(true);
      setKokoroBackend(nextEngine.getBackend());
      setStatusMessage(getReadyStatusMessage(nextEngine.getBackend()));
      warmupPromiseRef.current = Promise.resolve();
      return warmupPromiseRef.current;
    }

    setStatusMessage('Preparing Torch voice...');
    warmupPromiseRef.current = Promise.resolve()
      .then(() =>
        nextEngine.preload({
          onProgress(progress) {
            setStatusMessage(getProgressStatusMessage(progress));
          },
        })
      )
      .then(() => {
        setIsKokoroReady(true);
        setKokoroBackend(nextEngine.getBackend());
        setStatusMessage(getReadyStatusMessage(nextEngine.getBackend()));
      })
      .catch(() => {
        warmupPromiseRef.current = null;
        setIsKokoroReady(false);
        setKokoroBackend(null);
        setStatusMessage(getUnavailableStatusMessage());
      });

    return warmupPromiseRef.current;
  }, []);

  const stopPlayback = useCallback(() => {
    playbackTokenRef.current += 1;

    engineRef.current?.stop();
    activePlaybackRef.current?.stop();
    activePlaybackRef.current = null;
    setIsUsingFallbackVoice(false);
    setError(null);
    setStatus(enabled ? 'idle' : 'disabled');
  }, [enabled]);

  const playLatestAssistantMessage = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const latestAssistantMessage = getLatestAssistantMessage(messages);
    if (!latestAssistantMessage) {
      return;
    }

    const spokenText = sanitizeTutorSpeech(latestAssistantMessage);
    if (!spokenText) {
      return;
    }

    stopPlayback();

    const kokoroEngine = getEngine();
    if (!kokoroEngine.isReady()) {
      void warmupEngine();

      const speech = getBrowserSpeech();
      if (!speech.supported) {
        setStatus('error');
        setError('Torch voice is still warming up, and browser speech is unavailable.');
        return;
      }

      activePlaybackRef.current = speech;
      setIsUsingFallbackVoice(true);
      setStatus('speaking');
      setError(null);

      try {
        await speech.speak(spokenText);
        activePlaybackRef.current = null;
        setIsUsingFallbackVoice(false);
        setStatus('idle');
      } catch (speechError) {
        setStatus('error');
        setError(getErrorMessage(speechError));
        setIsUsingFallbackVoice(false);
      }
      return;
    }

    const playbackToken = playbackTokenRef.current + 1;
    playbackTokenRef.current = playbackToken;

    setStatus('loading');
    setError(null);
    setIsUsingFallbackVoice(false);
    setStatusMessage('Preparing Torch voice...');

    try {
      const audio = await kokoroEngine.generateAudio(spokenText);
      if (playbackTokenRef.current !== playbackToken) {
        return;
      }

      const playback = getPlayback();
      activePlaybackRef.current = playback;
      setStatus('speaking');
      await playback.play(audio);

      if (playbackTokenRef.current === playbackToken) {
        activePlaybackRef.current = null;
        setStatus('idle');
        setStatusMessage(getReadyStatusMessage(kokoroEngine.getBackend()));
      }
      return;
    } catch (kokoroError) {
      if (playbackTokenRef.current !== playbackToken) {
        return;
      }

      const speech = getBrowserSpeech();
      if (!speech.supported) {
        setStatus('error');
        setError(getErrorMessage(kokoroError));
        return;
      }

      setIsUsingFallbackVoice(true);
      activePlaybackRef.current = speech;
      setStatus('speaking');

      try {
        await speech.speak(spokenText);
        if (playbackTokenRef.current === playbackToken) {
          activePlaybackRef.current = null;
          setIsUsingFallbackVoice(false);
          setStatus('idle');
          setStatusMessage(kokoroEngine.isReady() ? getReadyStatusMessage(kokoroEngine.getBackend()) : getUnavailableStatusMessage());
        }
      } catch (speechError) {
        if (playbackTokenRef.current !== playbackToken) {
          return;
        }

        setStatus('error');
        setError(getErrorMessage(speechError));
        setIsUsingFallbackVoice(false);
      }
    }
  }, [enabled, getBrowserSpeech, getEngine, getPlayback, messages, stopPlayback]);

  useEffect(() => {
    if (!enabled) {
      stopPlayback();
      setStatus('disabled');
      setStatusMessage(null);
      return;
    }

    setStatus((currentStatus) => (currentStatus === 'disabled' ? 'idle' : currentStatus));
    void warmupEngine();
  }, [enabled, stopPlayback, warmupEngine]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (isUsingFallbackVoice) {
      return;
    }

    if (isKokoroReady) {
      setStatusMessage(getReadyStatusMessage(kokoroBackend));
    }
  }, [enabled, isKokoroReady, isUsingFallbackVoice, kokoroBackend]);

  useEffect(() => {
    stopPlayback();
  }, [sessionKey, stopPlayback]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const latestAssistantMessage = getLatestAssistantMessage(messages);
  const canPlayLatestAssistantMessage = Boolean(enabled && latestAssistantMessage);

  return {
    status,
    error,
    statusMessage,
    isLoadingVoice: status === 'loading',
    isSpeaking: status === 'speaking',
    isUsingFallbackVoice,
    isKokoroReady,
    kokoroBackend,
    latestAssistantMessage,
    canPlayLatestAssistantMessage,
    playLatestAssistantMessage,
    stopPlayback,
  };
}
