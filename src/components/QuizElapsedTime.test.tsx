import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quiz } from './Quiz';
import type { GradeConfig, Problem, ProblemType } from '../types';
import type { Theme } from '../hooks/useTheme';

function makeElapsedTimeProblem(): Problem {
  return {
    id: crypto.randomUUID(),
    display: '2:10 p.m. to 3:30 p.m. = ___',
    answer: 80,
    type: 'elapsedTime',
    typeName: 'Elapsed Time',
  };
}

function makeGrade(): GradeConfig {
  return {
    grade: 4,
    name: 'Grade 4',
    problemTypes: [],
  };
}

function makeProblemType(): ProblemType {
  return {
    id: 'elapsedTime',
    name: 'Elapsed Time',
    description: 'Calculate time between two times.',
    generate: makeElapsedTimeProblem,
  };
}

describe('Quiz elapsed time answers', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows a quiz-level toggle for minutes or hours and minutes', async () => {
    const user = userEvent.setup();

    render(
      <Quiz
        grade={makeGrade()}
        problemType={makeProblemType()}
        onComplete={vi.fn()}
        onBack={vi.fn()}
        theme={'light' as Theme}
        onToggleTheme={vi.fn()}
      />
    );

    const answerFormat = screen.getByRole('group', { name: /elapsed time answer format/i });

    expect(within(answerFormat).getByRole('button', { name: /^minutes$/i })).toBeInTheDocument();
    expect(within(answerFormat).getByRole('button', { name: /^hours \+ minutes$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/problem 1 total minutes/i)).toBeInTheDocument();

    await user.click(within(answerFormat).getByRole('button', { name: /^hours \+ minutes$/i }));

    expect(screen.queryByLabelText(/problem 1 total minutes/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/problem 1 hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/problem 1 minutes/i)).toBeInTheDocument();
  });

  it('scores hours-and-minutes input as correct after toggling modes', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <Quiz
        grade={makeGrade()}
        problemType={makeProblemType()}
        onComplete={onComplete}
        onBack={vi.fn()}
        theme={'light' as Theme}
        onToggleTheme={vi.fn()}
      />
    );

    const answerFormat = screen.getByRole('group', { name: /elapsed time answer format/i });

    await user.click(within(answerFormat).getByRole('button', { name: /^hours \+ minutes$/i }));

    await user.type(screen.getByLabelText(/problem 1 hours/i), '1');
    await user.type(screen.getByLabelText(/problem 1 minutes/i), '20');

    for (let problemNumber = 2; problemNumber <= 10; problemNumber += 1) {
      await user.type(screen.getByLabelText(new RegExp(`problem ${problemNumber} hours`, 'i')), '1');
      await user.type(screen.getByLabelText(new RegExp(`problem ${problemNumber} minutes`, 'i')), '20');
    }

    await user.click(screen.getByRole('button', { name: /check my answers/i }));

    expect(onComplete).toHaveBeenCalledWith(
      10,
      10,
      expect.any(Array),
      [80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      undefined
    );
  });

  it('allows minute-only answers after switching to hours and minutes mode', async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();

    render(
      <Quiz
        grade={makeGrade()}
        problemType={makeProblemType()}
        onComplete={onComplete}
        onBack={vi.fn()}
        theme={'light' as Theme}
        onToggleTheme={vi.fn()}
      />
    );

    const answerFormat = screen.getByRole('group', { name: /elapsed time answer format/i });

    await user.click(within(answerFormat).getByRole('button', { name: /^hours \+ minutes$/i }));
    await user.type(screen.getByLabelText(/problem 1 minutes/i), '20');

    const firstRow = screen.getByLabelText(/problem 1 hours/i).closest('.problem-row');
    expect(firstRow).not.toBeNull();
    expect(within(firstRow as HTMLElement).getByLabelText(/problem 1 hours/i)).toHaveValue('');
  });
});
