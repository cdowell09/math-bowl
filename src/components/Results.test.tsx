import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
  it('shows a help button for each incorrect answer', () => {
    renderResults();

    expect(screen.getAllByRole('button', { name: /help me with this one/i })).toHaveLength(1);
  });
});
