import { describe, expect, it } from 'vitest';
import { buildTutorPrompt } from './prompt';

describe('buildTutorPrompt', () => {
  it('grounds the tutor in the provided correct answer', () => {
    const prompt = buildTutorPrompt({
      grade: 2,
      problemType: 'Adding Money',
      problemDisplay: 'Q + D =',
      correctAnswer: 35,
      studentAnswer: 30,
      messages: [],
    });

    expect(prompt.system).toContain('use the provided correct answer as truth');
    expect(prompt.user).toContain('Correct answer: 35');
  });
});
