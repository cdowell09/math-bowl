import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { grade1 } from '../data/grades/grade1';
import { ProblemTypeSelector } from './ProblemTypeSelector';
import type { Theme } from '../hooks/useTheme';

afterEach(() => {
  cleanup();
});

function renderSelector() {
  const onSelect = vi.fn();
  const onOpenMentalMathLibrary = vi.fn();

  render(
    <ProblemTypeSelector
      grade={grade1}
      onSelect={onSelect}
      onBack={vi.fn()}
      onPrintWorksheet={vi.fn()}
      onOpenMentalMathLibrary={onOpenMentalMathLibrary}
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

  return { onSelect, onOpenMentalMathLibrary };
}

describe('ProblemTypeSelector', () => {
  it('opens the mental math library from the grade topic screen', async () => {
    const { onOpenMentalMathLibrary } = renderSelector();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /study winning tricks/i }));

    expect(onOpenMentalMathLibrary).toHaveBeenCalledWith();
  });

  it('still lets students start a normal practice topic', async () => {
    const { onSelect } = renderSelector();

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /^addition/i })[0]);

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'addTwoDigit' }));
  });
});
