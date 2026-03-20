import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { TutorMessage, TutorProblemContext, TutorResponse } from '../types/tutor';
import { TutorMarkdown } from './TutorMarkdown';

interface TutorPanelProps {
  isOpen: boolean;
  activeProblem: TutorProblemContext | null;
  response: TutorResponse | null;
  messages: TutorMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (content: string) => void | Promise<void>;
  onClose: () => void;
  onReset: () => void;
}

const TUTOR_AUTOFOLLOW_THRESHOLD_PX = 48;

function formatAnswer(answer: number | null) {
  return answer === null ? '—' : answer.toString();
}

function composeResponseContent(response: TutorResponse | null): string {
  if (!response) {
    return '';
  }

  const content = [response.summary, response.hint ? `Hint: ${response.hint}` : null, response.nextQuestion, response.workedExample]
    .filter((value): value is string => Boolean(value && value.trim() !== ''))
    .join('\n\n')
    .trim();

  return content;
}

function buildFallbackMessage(response: TutorResponse | null): TutorMessage[] {
  const content = composeResponseContent(response);
  return content ? [{ role: 'assistant', content }] : [];
}

function getVisibleMessages(messages: TutorMessage[], response: TutorResponse | null): TutorMessage[] {
  const composedResponse = composeResponseContent(response);

  if (messages.length > 0) {
    if (
      composedResponse &&
      messages[0]?.role === 'assistant' &&
      response?.summary?.trim() &&
      messages[0].content.trim() === response.summary.trim()
    ) {
      return [{ ...messages[0], content: composedResponse }, ...messages.slice(1)];
    }

    return messages;
  }

  return buildFallbackMessage(response);
}

export function TutorPanel({
  isOpen,
  activeProblem,
  response,
  messages,
  isLoading,
  error,
  onSendMessage,
  onClose,
  onReset,
}: TutorPanelProps) {
  const [draft, setDraft] = useState('');
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoFollowRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);
  const userScrollIntentRef = useRef(false);
  const userScrollIntentTimeoutRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const visibleMessages = getVisibleMessages(messages, response);
  const latestMessage = visibleMessages[visibleMessages.length - 1] ?? null;
  const latestTurnKey = `${latestMessage?.role ?? 'none'}:${latestMessage?.content ?? ''}:${isLoading ? 'loading' : 'idle'}`;

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

    setDraft('');
    await onSendMessage(content);
  };

  useEffect(() => {
    shouldAutoFollowRef.current = true;
  }, [activeProblem?.problemDisplay]);

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

  return (
    <aside className="tutor-panel" aria-label="Math tutor panel">
      <div className="tutor-panel-header">
        <div>
          <p className="tutor-panel-eyebrow">Math help</p>
          <h3>Torch the Tutor</h3>
        </div>
        <button type="button" className="tutor-panel-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="tutor-context-summary" aria-label="Problem summary">
        <span className="tutor-context-pill tutor-context-pill--problem">{activeProblem.problemDisplay}</span>
        <span className="tutor-context-pill">You said {formatAnswer(activeProblem.studentAnswer)}</span>
        <span className="tutor-context-pill">Correct answer {activeProblem.correctAnswer}</span>
      </div>

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

        <button type="button" className="tutor-reset-button" onClick={onReset}>
          Start over
        </button>
      </div>
    </aside>
  );
}
