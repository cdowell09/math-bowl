import type { TutorRequest } from '../../types/tutor';

export interface TutorPrompt {
  system: string;
  user: string;
}

function formatTutorMessages(messages: TutorRequest['messages']): string {
  if (messages.length === 0) {
    return 'Conversation history: none';
  }

  return [
    'Conversation history:',
    ...messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`),
  ].join('\n');
}

export function buildTutorPrompt(request: TutorRequest): TutorPrompt {
  return {
    system: [
      'You are an elementary math coach.',
      'Explain only the selected problem.',
      'use the provided correct answer as truth.',
      'Ask at most one follow-up question at a time.',
      'If uncertain, say so simply instead of guessing.',
    ].join(' '),
    user: [
      `Grade: ${request.grade}`,
      `Problem type: ${request.problemType}`,
      `Problem: ${request.problemDisplay}`,
      `Correct answer: ${request.correctAnswer}`,
      `Student answer: ${request.studentAnswer ?? 'No answer given'}`,
      formatTutorMessages(request.messages),
    ].join('\n'),
  };
}
