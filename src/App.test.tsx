import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('App mental math routes', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('opens a tricks page directly from its grade and topic url', async () => {
    window.history.replaceState(null, '', '/grade1/tricks/add-subtract');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /grade 1 add & subtract/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^add & subtract$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(window.location.pathname).toBe('/grade1/tricks/add-subtract');
  });

  it('updates the url when switching between tricks topics', async () => {
    window.history.replaceState(null, '', '/grade1/tricks/patterns');

    render(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /^subtraction$/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/grade1/tricks/subtraction');
    });

    expect(screen.getByRole('heading', { name: /grade 1 subtraction/i })).toBeInTheDocument();
  });

  it('scrolls back to the top when a quiz transitions to results', async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);

    render(<App />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /grade 1/i }));
    await user.click((await screen.findAllByRole('button', { name: /^patterns/i }))[0]);

    const answerInputs = await screen.findAllByRole('textbox');
    scrollTo.mockClear();

    for (const input of answerInputs) {
      await user.type(input, '1');
    }

    await user.click(screen.getByRole('button', { name: /check my answers/i }));

    expect(await screen.findByText(/nice try! practice makes perfect!/i)).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
