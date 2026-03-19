import { describe, expect, it } from 'vitest';
import { validateTutorRequest } from './validation';

describe('validateTutorRequest', () => {
  it('accepts a valid tutoring request', () => {
    expect(() =>
      validateTutorRequest({
        grade: 4,
        problemType: 'Decimals',
        problemDisplay: '2.5 + 1.5 =',
        correctAnswer: 4,
        studentAnswer: 3,
        messages: [],
      })
    ).not.toThrow();
  });
});
