import { describe, expect, it } from 'vitest';
import {
  getMentalMathGuide,
  getMentalMathGuideForProblem,
  summarizeMentalMathGuide,
} from './guides';

describe('mental math guides', () => {
  it('finds a guide by grade and problem type id', () => {
    const guide = getMentalMathGuide(1, 'addTwoDigit');

    expect(guide).not.toBeNull();
    expect(guide?.grade).toBe(1);
    expect(guide?.problemTypeId).toBe('addTwoDigit');
    expect(guide?.problemTypeName).toBe('Addition');
    expect(guide?.coreMoves.length).toBeGreaterThanOrEqual(3);
    expect(guide?.gamePlan.bestFirstMove.length).toBeGreaterThan(0);
  });

  it('finds a guide by generated problem type', () => {
    const guide = getMentalMathGuideForProblem(3, 'shortDivision');

    expect(guide).not.toBeNull();
    expect(guide?.problemTypeName).toBe('Short Division');
    expect(guide?.warmupChecklist.length).toBeGreaterThan(0);
  });

  it('returns null for an unsupported grade and problem type pair', () => {
    expect(getMentalMathGuide(2, 'not-a-real-topic')).toBeNull();
    expect(getMentalMathGuideForProblem(6, 'addTwoDigit')).toBeNull();
  });

  it('builds a compact summary for tutor grounding and small UI surfaces', () => {
    const guide = getMentalMathGuide(4, 'elapsedTime');

    expect(guide).not.toBeNull();

    const summary = summarizeMentalMathGuide(guide);

    expect(summary).toContain('Elapsed Time');
    expect(summary).toContain('Look for');
    expect(summary).toContain(guide?.coreMoves[0]?.title ?? '');
    expect(summary).not.toContain(guide?.confidenceNote ?? '');
  });
});
