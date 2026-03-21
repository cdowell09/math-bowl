import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { grade1 } from '../data/grades/grade1';
import { Quiz } from './Quiz';
import type { Theme } from '../hooks/useTheme';

describe('Quiz mental math tips', () => {
  it('shows a topic tip card for a regular practice topic', () => {
    render(
      <Quiz
        grade={grade1}
        problemType={grade1.problemTypes[2]}
        onComplete={vi.fn()}
        onBack={vi.fn()}
        theme={'light' as Theme}
        onToggleTheme={vi.fn()}
      />
    );

    expect(screen.getByText(/today's tip/i)).toBeInTheDocument();
    expect(screen.getByText(/Tens Then Ones/i)).toBeInTheDocument();
    expect(screen.getByText(/Look for:/i)).toBeInTheDocument();
    expect(screen.getByText(/Try first:/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
