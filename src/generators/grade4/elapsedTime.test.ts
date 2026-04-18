import { describe, expect, it } from 'vitest';
import { buildElapsedTimeProblem, generateElapsedTime } from './elapsedTime';

describe('generateElapsedTime', () => {
  it('computes midnight crossings from p.m. to a.m.', () => {
    const problem = buildElapsedTimeProblem(
      { hour: 8, minute: 45, period: 'p.m.' },
      { hour: 1, minute: 0, period: 'a.m.' },
    );

    expect(problem.display).toBe('8:45 p.m. to 1:00 a.m. = ___');
    expect(problem.answer).toBe(255);
  });

  it('does not force minutes-only wording in the prompt', () => {
    for (let i = 0; i < 50; i += 1) {
      const problem = generateElapsedTime();

      expect(problem.display).toContain(' = ___');
      expect(problem.display).not.toContain('___ minutes');
      expect(problem.answer).toBeGreaterThan(0);
    }
  });
});
