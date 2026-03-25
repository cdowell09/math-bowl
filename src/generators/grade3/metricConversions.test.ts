import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMetricConversion } from './metricConversions';

const allowedUnitPairs = new Set([
  'm->cm',
  'm->mm',
  'cm->mm',
  'km->m',
]);

function unitPairFor(problemDisplay: string) {
  const match = problemDisplay.match(/^\d+\s+(\w+)\s+=\s+___\s+(\w+)$/);

  if (!match) {
    throw new Error(`Unexpected display format: ${problemDisplay}`);
  }

  return `${match[1]}->${match[2]}`;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateMetricConversion', () => {
  it('only creates metric length conversions for grade 3', () => {
    const randomValues = [
      0 / 6,
      0,
      1 / 6,
      0,
      2 / 6,
      0,
      3 / 6,
      0,
      4 / 6,
      0,
      5 / 6,
      0,
    ];

    vi.spyOn(Math, 'random').mockImplementation(() => randomValues.shift() ?? 0);

    const seenPairs = Array.from({ length: 6 }, () =>
      unitPairFor(generateMetricConversion().display)
    );

    expect(seenPairs.every((pair) => allowedUnitPairs.has(pair))).toBe(true);
  });
});
