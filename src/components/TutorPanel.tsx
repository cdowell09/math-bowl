import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { TutorProblemContext, TutorResponse } from '../types/tutor';
import { TutorMarkdown } from './TutorMarkdown';

type TutorTtsStatus = 'idle' | 'loading' | 'speaking';

interface TutorTtsControls {
  canPlayLatestAssistantMessage: boolean;
  ttsStatus: TutorTtsStatus;
  ttsStatusMessage?: string | null;
  onPlayLatestAssistantMessage: () => void | Promise<void>;
  onStopPlayback: () => void;
}

interface TutorPanelProps {
  isOpen: boolean;
  activeProblem: TutorProblemContext | null;
  response: TutorResponse | null;
  isLoading: boolean;
  error: string | null;
  tts?: TutorTtsControls;
  onSendMessage: (content: string) => void | Promise<void>;
  onClose: () => void;
  onReset: () => void;
}

const TUTOR_AUTOFOLLOW_THRESHOLD_PX = 48;

function formatAnswer(answer: number | null) {
  return answer === null ? '—' : answer.toString();
}

export function TutorPanel({
  isOpen,
  activeProblem,
  response,
  isLoading,
  error,
  tts,
  onSendMessage,
  onClose,
  onReset,
}: TutorPanelProps) {
  const [draft, setDraft] = useState('');
  const panelRef = useRef<HTMLElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoFollowRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);
  const userScrollIntentRef = useRef(false);
  const userScrollIntentTimeoutRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const visibleMessages = response?.messages ?? [];
  const latestMessage = visibleMessages[visibleMessages.length - 1] ?? null;
  const latestTurnKey = `${latestMessage?.role ?? 'none'}:${latestMessage?.content ?? ''}:${isLoading ? 'loading' : 'idle'}`;
  const isReadAloudBusy = tts?.ttsStatus !== 'idle';
  const readAloudLabel = tts?.ttsStatus === 'loading' ? 'Loading voice...' : tts?.ttsStatus === 'speaking' ? 'Stop' : 'Read aloud';
  const isReadAloudDisabled = !tts?.canPlayLatestAssistantMessage && !isReadAloudBusy;

  const clearUserScrollIntentTimeout = () => {
    if (userScrollIntentTimeoutRef.current !== null) {
      window.clearTimeout(userScrollIntentTimeoutRef.current);
      userScrollIntentTimeoutRef.current = null;
    }
  };

  const scheduleUserScrollIntentReset = () => {
    clearUserScrollIntentTimeout();
    userScrollIntentTimeoutRef.current = window.setTimeout(() => {
      userScrollIntentRef.current = false;
      userScrollIntentTimeoutRef.current = null;
    }, 180);
  };

  const markUserScrollIntent = () => {
    userScrollIntentRef.current = true;
    scheduleUserScrollIntentReset();
  };

  const clearAutoScrollFrames = () => {
    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  };

  const updateAutoFollowState = () => {
    if (isProgrammaticScrollRef.current) {
      return;
    }

    if (!userScrollIntentRef.current) {
      return;
    }

    const messageList = messageListRef.current;
    if (!messageList) {
      return;
    }

    scheduleUserScrollIntentReset();
    const distanceFromBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight;
    shouldAutoFollowRef.current = distanceFromBottom <= TUTOR_AUTOFOLLOW_THRESHOLD_PX;
  };

  const scrollToLatestTurn = () => {
    const messageList = messageListRef.current;
    if (!messageList) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    clearAutoScrollFrames();

    const applyScroll = () => {
      if (typeof messageList.scrollTo === 'function') {
        messageList.scrollTo({ top: messageList.scrollHeight });
      } else {
        messageList.scrollTop = messageList.scrollHeight;
      }
    };

    applyScroll();
    autoScrollFrameRef.current = window.requestAnimationFrame(() => {
      applyScroll();
      autoScrollFrameRef.current = window.requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
        shouldAutoFollowRef.current = true;
        updateAutoFollowState();
        autoScrollFrameRef.current = null;
      });
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    tts?.onStopPlayback();
    setDraft('');
    await onSendMessage(content);
  };

  const handleClose = () => {
    tts?.onStopPlayback();
    onClose();
  };

  const handleReset = () => {
    tts?.onStopPlayback();
    onReset();
  };

  const handleReadAloud = () => {
    if (!tts) {
      return;
    }

    if (isReadAloudBusy) {
      tts.onStopPlayback();
      return;
    }

    if (!tts.canPlayLatestAssistantMessage) {
      return;
    }

    void tts.onPlayLatestAssistantMessage();
  };

  useEffect(() => {
    shouldAutoFollowRef.current = true;
  }, [activeProblem?.problemDisplay]);

  useEffect(() => {
    if (!isOpen || !activeProblem) {
      return;
    }

    if (typeof panelRef.current?.scrollIntoView !== 'function') {
      return;
    }

    panelRef.current.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
      inline: 'nearest',
    });
  }, [activeProblem, isOpen]);

  useEffect(() => {
    return () => {
      clearAutoScrollFrames();
      clearUserScrollIntentTimeout();
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !activeProblem) {
      return;
    }

    if (!shouldAutoFollowRef.current) {
      return;
    }

    scrollToLatestTurn();
  }, [activeProblem, isOpen, latestTurnKey]);

  if (!isOpen || !activeProblem) {
    return null;
  }

  const isFallbackMode = response?.mode === 'fallback';

  return (
    <aside ref={panelRef} className="tutor-panel" aria-label="Math tutor panel">
      <div className="tutor-panel-header">
        <div>
          <p className="tutor-panel-eyebrow">Math help</p>
          <h3>Torch the Tutor</h3>
        </div>
        <button type="button" className="tutor-panel-close" onClick={handleClose}>
          Close
        </button>
      </div>

      <div className="tutor-context-summary" aria-label="Problem summary">
        <span className="tutor-context-pill tutor-context-pill--problem">{activeProblem.problemDisplay}</span>
        <span className="tutor-context-pill">You said {formatAnswer(activeProblem.studentAnswer)}</span>
        <span className="tutor-context-pill">Correct answer {activeProblem.correctAnswer}</span>
      </div>

      {tts && (
        <div className="tutor-tts-controls" aria-label="Read aloud controls">
          <button
            type="button"
            className={`tutor-tts-button${isReadAloudBusy ? ' tutor-tts-button--active' : ''}`}
            onClick={handleReadAloud}
            disabled={isReadAloudDisabled}
            aria-pressed={isReadAloudBusy}
          >
            {readAloudLabel}
          </button>
          {tts.ttsStatusMessage && <p className="tutor-tts-status" role="status">{tts.ttsStatusMessage}</p>}
        </div>
      )}

      {isFallbackMode && (
        <div className="tutor-status-banner" role="status">
          <strong>Torch is using fallback help right now.</strong> Live AI help is temporarily unavailable, so this reply may be more limited.
        </div>
      )}

      <div
        ref={messageListRef}
        className="tutor-message-list"
        role="log"
        aria-live="polite"
        onScroll={updateAutoFollowState}
        onWheel={markUserScrollIntent}
        onTouchMove={markUserScrollIntent}
        onPointerDown={markUserScrollIntent}
      >
        {visibleMessages.length === 0 ? (
          <p className="tutor-empty-state">
            Ask what part feels tricky and we&apos;ll work through it step by step.
          </p>
        ) : (
          visibleMessages.map((message, index) => (
            <div key={`${message.role}-${index}-${message.content}`} className={`tutor-message tutor-message--${message.role}`}>
              <span className="tutor-message-role">{message.role === 'user' ? 'You' : 'Torch'}</span>
              <TutorMarkdown content={message.content} className="tutor-message-text" />
            </div>
          ))
        )}
        {isLoading && <div className="tutor-message tutor-message--loading">Thinking...</div>}
      </div>

      {error && <div className="tutor-error">{error}</div>}

      <div className="tutor-panel-footer">
        <form className="tutor-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="tutor-composer-input">
            Ask for help
          </label>
          <input
            id="tutor-composer-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tell me what part was confusing"
            className="tutor-composer-input"
          />
          <button type="submit" className="tutor-composer-button" disabled={!draft.trim() || isLoading}>
            Send
          </button>
        </form>

        <button type="button" className="tutor-reset-button" onClick={handleReset}>
          Start over
        </button>
      </div>
    </aside>
  );
}
