import type { TutorResponse } from '../../types/tutor';

export function buildTutorFallback(correctAnswer: number): TutorResponse {
  return {
    summary: `I'm having trouble explaining this one right now. The correct answer is ${correctAnswer}.`,
    hint: 'Try looking at the problem one small step at a time.',
    nextQuestion: null,
    workedExample: null,
    messages: [
      {
        role: 'assistant',
        content: `I'm having trouble explaining this one right now. The correct answer is ${correctAnswer}. Try looking at the problem one small step at a time.`,
      },
    ],
  };
}
