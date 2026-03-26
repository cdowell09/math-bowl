import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TimerSettingsModal } from './TimerSettingsModal';

afterEach(() => {
  cleanup();
});

describe('TimerSettingsModal', () => {
  it('lets students edit seconds per problem with backspace typing flow', async () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TimerSettingsModal
        config={{
          mode: 'per-problem',
          secondsPerProblem: 30,
          totalMinutes: 5,
        }}
        onSave={onSave}
        onClose={onClose}
      />
    );

    const input = screen.getByRole('spinbutton', { name: /seconds per problem/i });
    await user.click(input);
    await user.type(input, '{backspace}{backspace}45');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        secondsPerProblem: 45,
      })
    );
  });
});
