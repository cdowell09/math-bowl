import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TutorMessage, TutorProblemContext, TutorResponse } from '../types/tutor';

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

function formatAnswer(answer: number | null) {
  return answer === null ? '—' : answer.toString();
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

  if (!isOpen || !activeProblem) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    setDraft('');
    await onSendMessage(content);
  };

  return (
    <aside className="tutor-panel" aria-label="Math tutor panel">
      <div className="tutor-panel-header">
        <div>
          <p className="tutor-panel-eyebrow">Math help</p>
          <h3>Let&apos;s work through this one</h3>
        </div>
        <button type="button" className="tutor-panel-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="tutor-context-grid">
        <div className="tutor-context-card">
          <span>Problem</span>
          <strong>{activeProblem.problemDisplay}</strong>
        </div>
        <div className="tutor-context-card">
          <span>Your answer</span>
          <strong>{formatAnswer(activeProblem.studentAnswer)}</strong>
        </div>
        <div className="tutor-context-card">
          <span>Correct answer</span>
          <strong>{activeProblem.correctAnswer}</strong>
        </div>
      </div>

      <div className="tutor-response-stack">
        {response?.summary && <p className="tutor-response-copy">{response.summary}</p>}
        {response?.hint && <p className="tutor-response-copy tutor-response-copy--hint">Hint: {response.hint}</p>}
        {response?.nextQuestion && <p className="tutor-response-copy tutor-response-copy--question">{response.nextQuestion}</p>}
        {response?.workedExample && <p className="tutor-response-copy tutor-response-copy--example">{response.workedExample}</p>}
      </div>

      <div className="tutor-message-list" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="tutor-empty-state">
            Ask what part feels tricky and we&apos;ll work through it step by step.
          </p>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}-${message.content}`} className={`tutor-message tutor-message--${message.role}`}>
              <span className="tutor-message-role">{message.role === 'user' ? 'You' : 'Tutor'}</span>
              <span className="tutor-message-text">{message.content}</span>
            </div>
          ))
        )}
        {isLoading && <div className="tutor-message tutor-message--loading">Thinking...</div>}
      </div>

      {error && <div className="tutor-error">{error}</div>}

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
    </aside>
  );
}
