import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { grade4 } from '../../data/grades/grade4';
import { MentalMathLibrary } from './MentalMathLibrary';

describe('MentalMathLibrary', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders topic guides for the selected grade and switches topics', async () => {
    const onSelectProblemType = vi.fn();

    render(
      <MentalMathLibrary
        grade={grade4}
        activeProblemType={grade4.problemTypes[0]}
        onBack={vi.fn()}
        onSelectProblemType={onSelectProblemType}
        onStartPractice={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /winning tricks for grade 4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /elapsed time/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /grade 4 negative number equations/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Undo the Operation/i).length).toBeGreaterThan(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /elapsed time/i }));

    expect(onSelectProblemType).toHaveBeenCalledWith(expect.objectContaining({ id: 'elapsedTime' }));
  });

  it('keeps support sections open while core moves stay collapsible', async () => {
    render(
      <MentalMathLibrary
        grade={grade4}
        activeProblemType={grade4.problemTypes[0]}
        onBack={vi.fn()}
        onSelectProblemType={vi.fn()}
        onStartPractice={vi.fn()}
      />
    );

    const user = userEvent.setup();
    expect(screen.getByRole('heading', { name: /game plan/i }).closest('details')).toBeNull();
    expect(screen.getByRole('heading', { name: /warm-up checklist/i }).closest('details')).toBeNull();
    expect(screen.getByRole('heading', { name: /common traps/i }).closest('details')).toBeNull();
    expect(screen.queryByRole('heading', { name: /confidence note/i })).not.toBeInTheDocument();

    const moveLabel = screen.getByText(/^Undo the Operation$/i);
    const moveToggle = moveLabel.closest('summary');
    if (!moveToggle) {
      throw new Error('Expected move summary');
    }
    const moveDetails = moveToggle.closest('details');

    expect(moveDetails).not.toBeNull();
    expect(moveDetails).not.toHaveAttribute('open');

    await user.click(moveToggle as HTMLElement);

    expect(moveDetails).toHaveAttribute('open');
    expect(within(moveDetails as HTMLElement).getByText(/When to use it:/i)).toBeVisible();
  });
});
