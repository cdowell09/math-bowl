import { describe, expect, it } from 'vitest';
import { generateElapsedTime } from './elapsedTime';

describe('generateElapsedTime', () => {
  it('does not force minutes-only wording in the prompt', () => {
    for (let i = 0; i < 50; i += 1) {
      const problem = generateElapsedTime();

      expect(problem.display).toContain(' = ___');
      expect(problem.display).not.toContain('___ minutes');
      expect(problem.answer).toBeGreaterThan(0);
    }
  });
});
