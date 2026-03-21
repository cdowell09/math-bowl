import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    tts: {
      canPlayLatestAssistantMessage: true,
      ttsStatus: 'idle',
      ttsStatusMessage: null,
      onPlayLatestAssistantMessage: vi.fn(),
      onStopPlayback: vi.fn(),
    },
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

  it('shows read aloud controls with the expected labels', () => {
    const { rerender } = render(
      <TutorPanel
        {...makeProps({
          tts: {
            canPlayLatestAssistantMessage: true,
            ttsStatus: 'idle',
            ttsStatusMessage: null,
            onPlayLatestAssistantMessage: vi.fn(),
            onStopPlayback: vi.fn(),
          },
        })}
      />
    );

    expect(screen.getByRole('button', { name: /read aloud/i })).toBeInTheDocument();

    rerender(
      <TutorPanel
        {...makeProps({
          tts: {
            canPlayLatestAssistantMessage: true,
            ttsStatus: 'loading',
            ttsStatusMessage: 'Downloading Torch voice... 42%',
            onPlayLatestAssistantMessage: vi.fn(),
            onStopPlayback: vi.fn(),
          },
        })}
      />
    );

    expect(screen.getByRole('button', { name: /loading voice/i })).toBeInTheDocument();
    expect(screen.getByText(/downloading torch voice/i)).toBeInTheDocument();

    rerender(
      <TutorPanel
        {...makeProps({
          tts: {
            canPlayLatestAssistantMessage: true,
            ttsStatus: 'speaking',
            ttsStatusMessage: 'Torch is reading the answer now.',
            onPlayLatestAssistantMessage: vi.fn(),
            onStopPlayback: vi.fn(),
          },
        })}
      />
    );

    expect(screen.getByRole('button', { name: /^stop$/i })).toBeInTheDocument();

    rerender(
      <TutorPanel
        {...makeProps({
          tts: {
            canPlayLatestAssistantMessage: true,
            ttsStatus: 'idle',
            ttsStatusMessage: 'Torch voice ready on WebGPU.',
            onPlayLatestAssistantMessage: vi.fn(),
            onStopPlayback: vi.fn(),
          },
        })}
      />
    );

    expect(screen.getByText(/torch voice ready on webgpu/i)).toBeInTheDocument();
  });

  it('stops playback when closing, resetting, or sending a new message', async () => {
    const onStopPlayback = vi.fn();
    const onSendMessage = vi.fn();
    const onClose = vi.fn();
    const onReset = vi.fn();

    render(
      <TutorPanel
        {...makeProps({
          tts: {
            canPlayLatestAssistantMessage: true,
            ttsStatus: 'speaking',
            ttsStatusMessage: 'Torch is reading the answer now.',
            onPlayLatestAssistantMessage: vi.fn(),
            onStopPlayback,
          },
          onSendMessage,
          onClose,
          onReset,
        })}
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onStopPlayback).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /start over/i }));
    expect(onStopPlayback).toHaveBeenCalledTimes(2);
    expect(onReset).toHaveBeenCalledTimes(1);

    await user.type(screen.getByLabelText(/ask for help/i), 'I need another hint');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(onStopPlayback).toHaveBeenCalledTimes(3);
    expect(onSendMessage).toHaveBeenCalledWith('I need another hint');
  });
});
