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

  it('includes the active conversation history in the prompt', () => {
    const prompt = buildTutorPrompt({
      grade: 3,
      problemType: 'Short Division',
      problemDisplay: '24 ÷ 6 =',
      correctAnswer: 4,
      studentAnswer: 6,
      messages: [
        { role: 'user', content: "I thought 6 goes into 24 six times." },
        { role: 'assistant', content: 'Let us count together one step at a time.' },
      ],
    });

    expect(prompt.user).toContain('Conversation history:');
    expect(prompt.user).toContain("USER: I thought 6 goes into 24 six times.");
    expect(prompt.user).toContain('ASSISTANT: Let us count together one step at a time.');
  });
});
