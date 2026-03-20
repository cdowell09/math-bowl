import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TutorProblemContext, TutorResponse } from '../types/tutor';
import { TutorPanel } from './TutorPanel';

function makeProblem(): TutorProblemContext {
  return {
    grade: 3,
    problemType: 'Patterns',
    problemDisplay: '15, 20, 25, 30, ___',
    correctAnswer: 35,
    studentAnswer: 2,
  };
}

function makeResponse(): TutorResponse {
  return {
    summary: 'Start by finding how much the pattern grows each time.',
    hint: null,
    nextQuestion: null,
    workedExample: null,
    messages: [{ role: 'assistant', content: 'Start by finding how much the pattern grows each time.' }],
  };
}

function makeProps(overrides: Partial<ComponentProps<typeof TutorPanel>> = {}): ComponentProps<typeof TutorPanel> {
  return {
    isOpen: true,
    activeProblem: makeProblem(),
    response: makeResponse(),
    messages: [{ role: 'assistant', content: 'Start by finding how much the pattern grows each time.' }],
    isLoading: false,
    error: null,
    onSendMessage: vi.fn(),
    onClose: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
}

function mockScrollMetrics(element: HTMLElement, metrics: { scrollTop: number; clientHeight: number; scrollHeight: number }) {
  let { scrollTop, clientHeight, scrollHeight } = metrics;

  Object.defineProperties(element, {
    scrollTop: {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value;
      },
    },
    clientHeight: {
      configurable: true,
      get: () => clientHeight,
    },
    scrollHeight: {
      configurable: true,
      get: () => scrollHeight,
    },
  });

  return {
    setScrollTop(value: number) {
      scrollTop = value;
    },
    setScrollHeight(value: number) {
      scrollHeight = value;
    },
  };
}

async function waitForAnimationFrames(count: number) {
  for (let index = 0; index < count; index += 1) {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
}

describe('TutorPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('scrolls to the latest turn when new messages arrive and the user is near the bottom', async () => {
    const scrollTo = vi.fn();
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;

    try {
      const { rerender } = render(<TutorPanel {...makeProps()} />);
      const messageList = screen.getByRole('log');
      const metrics = mockScrollMetrics(messageList, {
        scrollTop: 120,
        clientHeight: 200,
        scrollHeight: 340,
      });

      scrollTo.mockClear();
      metrics.setScrollHeight(520);

      rerender(
        <TutorPanel
          {...makeProps({
            messages: [
              { role: 'assistant', content: 'Start by finding how much the pattern grows each time.' },
              { role: 'user', content: 'I think it goes up by 5.' },
            ],
          })}
        />
      );

      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledWith({ top: 520 });
      });
    } finally {
      HTMLElement.prototype.scrollTo = originalScrollTo;
    }
  });

  it('keeps auto-follow enabled when its own scroll event fires during tailing', async () => {
    const originalScrollTo = HTMLElement.prototype.scrollTo;

    try {
      const { rerender } = render(<TutorPanel {...makeProps()} />);
      const messageList = screen.getByRole('log');
      const metrics = mockScrollMetrics(messageList, {
        scrollTop: 120,
        clientHeight: 200,
        scrollHeight: 340,
      });

      const scrollTo = vi.fn(({ top }: { top: number }) => {
        metrics.setScrollTop(top);
        fireEvent.scroll(messageList);
      });

      HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;
      scrollTo.mockClear();

      metrics.setScrollHeight(520);

      rerender(
        <TutorPanel
          {...makeProps({
            messages: [
              { role: 'assistant', content: 'Start by finding how much the pattern grows each time.' },
              { role: 'user', content: 'I think it goes up by 5.' },
            ],
          })}
        />
      );

      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledTimes(1);
      });

      await Promise.resolve();

      metrics.setScrollHeight(700);

      rerender(
        <TutorPanel
          {...makeProps({
            messages: [
              { role: 'assistant', content: 'Start by finding how much the pattern grows each time.' },
              { role: 'user', content: 'I think it goes up by 5.' },
              { role: 'assistant', content: 'Exactly, now add 5 one more time.' },
            ],
          })}
        />
      );

      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledTimes(2);
        expect(scrollTo).toHaveBeenLastCalledWith({ top: 700 });
      });
    } finally {
      HTMLElement.prototype.scrollTo = originalScrollTo;
    }
  });

  it('keeps auto-follow enabled when a scroll event happens without user scroll intent', async () => {
    const scrollTo = vi.fn();
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;

    try {
      const { rerender } = render(<TutorPanel {...makeProps()} />);
      const messageList = screen.getByRole('log');
      const metrics = mockScrollMetrics(messageList, {
        scrollTop: 120,
        clientHeight: 200,
        scrollHeight: 340,
      });

      scrollTo.mockClear();
      await Promise.resolve();

      metrics.setScrollTop(20);
      fireEvent.scroll(messageList);

      metrics.setScrollHeight(520);

      rerender(
        <TutorPanel
          {...makeProps({
            messages: [
              { role: 'assistant', content: 'Start by finding how much the pattern grows each time.' },
              { role: 'user', content: 'I think it goes up by 5.' },
            ],
          })}
        />
      );

      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalledWith({ top: 520 });
      });
    } finally {
      HTMLElement.prototype.scrollTo = originalScrollTo;
    }
  });

  it('does not auto-scroll after the user scrolls upward', async () => {
    const scrollTo = vi.fn();
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo;

    try {
      const { rerender } = render(<TutorPanel {...makeProps()} />);
      const messageList = screen.getByRole('log');
      const metrics = mockScrollMetrics(messageList, {
        scrollTop: 120,
        clientHeight: 200,
        scrollHeight: 340,
      });

      await waitFor(() => {
        expect(scrollTo).toHaveBeenCalled();
      });

      await waitForAnimationFrames(2);
      scrollTo.mockClear();
      fireEvent.wheel(messageList);
      metrics.setScrollTop(20);
      fireEvent.scroll(messageList);

      metrics.setScrollHeight(520);

      rerender(
        <TutorPanel
          {...makeProps({
            messages: [
              { role: 'assistant', content: 'Start by finding how much the pattern grows each time.' },
              { role: 'user', content: 'I think it goes up by 5.' },
            ],
          })}
        />
      );

      await waitFor(() => {
        expect(scrollTo).not.toHaveBeenCalled();
      });
    } finally {
      HTMLElement.prototype.scrollTo = originalScrollTo;
    }
  });

  it('shows a fallback-mode notice when the tutor is using offline help', () => {
    render(
      <TutorPanel
        {...makeProps({
          response: {
            ...makeResponse(),
            mode: 'fallback',
            fallbackReason: 'Gemini request failed with 429',
          },
        })}
      />
    );

    expect(
      screen.getByText(/torch is using fallback help right now/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/live ai help is temporarily unavailable/i)
    ).toBeInTheDocument();
  });
});
