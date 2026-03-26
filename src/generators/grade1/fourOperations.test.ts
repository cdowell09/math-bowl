import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateFourOperations } from './fourOperations';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateFourOperations', () => {
  it('does not generate negative answers for grade 1', () => {
    const randomValues = [
      0.25, // 3
      0.7,  // 7
      0.95, // 9
      0.15, // 2
      0.9,  // +
      0.1,  // -
      0.2,  // -
    ];

    vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0.9);

    const problem = generateFourOperations();

    expect(problem.answer).toBeGreaterThanOrEqual(0);
  });
});
