import { describe, expect, it } from 'vitest';
import { buildTutorFallback } from './fallback';

describe('buildTutorFallback', () => {
  it('gives a useful explanation for number patterns', () => {
    const response = buildTutorFallback({
      grade: 1,
      problemType: 'Patterns',
      problemDisplay: '78, 73, 68, 63, ___',
      correctAnswer: 58,
      studentAnswer: 5,
      messages: [],
    });

    expect(response.summary).toContain('down by 5');
    expect(response.summary).toContain('58');
    expect(response.nextQuestion).toContain('63');
    expect(response.mode).toBe('fallback');
  });

  it('does not treat other comma-separated problems as patterns', () => {
    const response = buildTutorFallback({
      grade: 5,
      problemType: 'Finding Mean',
      problemDisplay: 'Find the mean of 2, 4, 6, 8',
      correctAnswer: 5,
      studentAnswer: 4,
      messages: [],
    });

    expect(response.summary).toContain('correct answer is 5');
    expect(response.summary).not.toContain('go up by');
    expect(response.summary).not.toContain('go down by');
  });

  it('gives a useful explanation for solving for x problems', () => {
    const response = buildTutorFallback({
      grade: 5,
      problemType: 'Solving for x',
      problemDisplay: '7x - 9 = 12',
      correctAnswer: 3,
      studentAnswer: 2,
      messages: [],
    });

    expect(response.summary).toContain('Add 9 to both sides');
    expect(response.summary).toContain('7x = 21');
    expect(response.summary).toContain('x = 3');
    expect(response.nextQuestion).toContain('21 divided by 7');
  });
});
