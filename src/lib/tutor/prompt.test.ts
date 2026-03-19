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

  it('keeps the prompt history bounded to the latest tutor messages', () => {
    const prompt = buildTutorPrompt({
      grade: 5,
      problemType: 'Solving for x',
      problemDisplay: 'x + 4 = 9',
      correctAnswer: 5,
      studentAnswer: 7,
      messages: Array.from({ length: 8 }, (_, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: `message ${index + 1}`,
      })),
    });

    expect(prompt.user).toContain('Conversation history:');
    expect(prompt.user).not.toContain('message 1');
    expect(prompt.user).not.toContain('message 2');
    expect(prompt.user).toContain('USER: message 3');
    expect(prompt.user).toContain('ASSISTANT: message 8');
  });
});
