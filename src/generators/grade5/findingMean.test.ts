import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateFindingMean } from './findingMean';

afterEach(() => {
  vi.restoreAllMocks();
});

function numbersFromDisplay(display: string): number[] {
  const prefix = 'Find the mean: ';
  const values = display.startsWith(prefix) ? display.slice(prefix.length) : display;

  return values.split(',').map((value) => Number(value.trim()));
}

describe('generateFindingMean', () => {
  it('always generates exactly 5 numbers', () => {
    vi.spyOn(Math, 'random').mockImplementation(() => 0);

    const problem = generateFindingMean();
    const numbers = numbersFromDisplay(problem.display);

    expect(numbers).toHaveLength(5);
  });
});
