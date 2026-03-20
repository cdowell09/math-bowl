import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GradeConfig, Problem, ProblemType } from '../types';
import type { TimerConfig } from '../types/timer';
import { Results } from './Results';
import type { Theme } from '../hooks/useTheme';

function makeProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    display: overrides.display ?? '5 + 3 =',
    answer: overrides.answer ?? 8,
    type: overrides.type ?? 'addition',
    typeName: overrides.typeName ?? 'Addition',
  };
}

function makeGrade(): GradeConfig {
  return {
    grade: 1,
    name: 'Grade 1',
    problemTypes: [],
  };
}

function makeProblemType(): ProblemType {
  return {
    id: 'addition',
    name: 'Addition',
    description: 'Add the numbers.',
    generate: () => makeProblem(),
  };
}

function renderResults() {
  const timerConfig: TimerConfig = {
    mode: 'none',
    secondsPerProblem: 30,
    totalMinutes: 5,
  };
  const theme = 'light' as Theme;

  render(
    <Results
      score={1}
      total={2}
      problems={[makeProblem(), makeProblem({ id: 'p2', display: '9 - 4 =', answer: 5, type: 'subtraction', typeName: 'Subtraction' })]}
      answers={[8, 6]}
      onTryAgain={vi.fn()}
      onBack={vi.fn()}
      onPrintWorksheet={vi.fn()}
      grade={makeGrade()}
      problemType={makeProblemType()}
      timerConfig={timerConfig}
      onTimerToggle={vi.fn()}
      onOpenTimerSettings={vi.fn()}
      theme={theme}
      onToggleTheme={vi.fn()}
    />
  );
}

describe('Results', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.stubEnv('VITE_ENABLE_RESULTS_TUTOR', 'true');
  });

  it('shows a help button for each incorrect answer', () => {
    renderResults();

    expect(screen.getAllByRole('button', { name: /get help from torch/i })).toHaveLength(1);
  });

  it('tracks the active tutor row by problem id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            summary: 'Start with the problem you picked.',
            hint: null,
            nextQuestion: null,
            workedExample: null,
            messages: [{ role: 'assistant', content: 'Start with the problem you picked.' }],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );

    const duplicateProblem: Problem = {
      id: 'duplicate-2',
      display: '9 - 4 =',
      answer: 5,
      type: 'subtraction',
      typeName: 'Subtraction',
    };

    render(
      <Results
        score={0}
        total={2}
        problems={[
          { id: 'duplicate-1', display: '9 - 4 =', answer: 5, type: 'subtraction', typeName: 'Subtraction' },
          duplicateProblem,
        ]}
        answers={[6, 6]}
        onTryAgain={vi.fn()}
        onBack={vi.fn()}
        onPrintWorksheet={vi.fn()}
        grade={makeGrade()}
        problemType={makeProblemType()}
        timerConfig={{
          mode: 'none',
          secondsPerProblem: 30,
          totalMinutes: 5,
        }}
        onTimerToggle={vi.fn()}
        onOpenTimerSettings={vi.fn()}
        theme={'light' as Theme}
        onToggleTheme={vi.fn()}
      />
    );

    const tutorButtons = screen.getAllByRole('button', { name: /get help from torch/i });
    const user = userEvent.setup();
    await user.click(tutorButtons[0]);

    await waitFor(() => {
      expect(tutorButtons[0]).toHaveAttribute('aria-pressed', 'true');
      expect(tutorButtons[1]).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('renders tutor markdown as formatted content in the chat stream', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            summary: 'Try **subtracting 4** first.\n\n- Start with 9\n- Then subtract 4',
            hint: 'What is `9 - 4`?',
            nextQuestion: null,
            workedExample: null,
            messages: [
              {
                role: 'assistant',
                content: 'Try **subtracting 4** first.\n\n- Start with 9\n- Then subtract 4',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );

    renderResults();

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /get help from torch/i })[0]);

    expect(await screen.findByText('Torch')).toBeInTheDocument();
    const emphasizedText = await screen.findAllByText('subtracting 4');
    expect(emphasizedText[0].tagName).toBe('STRONG');
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getByText('What is ', { exact: false }).querySelector('code')?.textContent).toBe('9 - 4');
    expect(screen.queryByText('**subtracting 4**')).not.toBeInTheDocument();
  });

  it('shows the opening tutor reply in the chat history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            summary: 'Break 52 + 26 into tens and ones.',
            hint: null,
            nextQuestion: null,
            workedExample: null,
            messages: [{ role: 'assistant', content: 'Break 52 + 26 into tens and ones.' }],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );

    renderResults();

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /get help from torch/i })[0]);

    const openingReplies = await screen.findAllByText('Break 52 + 26 into tens and ones.');
    expect(openingReplies).toHaveLength(1);
    expect(screen.getByText('Torch')).toBeInTheDocument();
  });
});
