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

  it('keeps only the most recent tutor messages', () => {
    const request = validateTutorRequest({
      grade: 4,
      problemType: 'Decimals',
      problemDisplay: '2.5 + 1.5 =',
      correctAnswer: 4,
      studentAnswer: 3,
      messages: Array.from({ length: 8 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `message ${index + 1}`,
      })),
    });

    expect(request.messages).toHaveLength(6);
    expect(request.messages[0]?.content).toBe('message 3');
    expect(request.messages[5]?.content).toBe('message 8');
  });
});
