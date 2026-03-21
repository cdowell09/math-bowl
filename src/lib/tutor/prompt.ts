import type { TutorRequest } from '../../types/tutor';
import { MAX_TUTOR_MESSAGES } from './validation.js';
import { getMentalMathGuideForProblem, summarizeMentalMathGuide } from '../mentalMath/guides';

export interface TutorPrompt {
  system: string;
  user: string;
}

function formatTutorMessages(messages: TutorRequest['messages']): string {
  const boundedMessages = messages.slice(-MAX_TUTOR_MESSAGES);

  if (boundedMessages.length === 0) {
    return 'Conversation history: none';
  }

  return [
    'Conversation history:',
    ...boundedMessages.map((message) => `${message.role.toUpperCase()}: ${message.content}`),
  ].join('\n');
}

export function buildTutorPrompt(request: TutorRequest): TutorPrompt {
  const guideSummary = summarizeMentalMathGuide(
    getMentalMathGuideForProblem(request.grade, request.problemType)
  );

  return {
    system: [
      'You are an elementary math coach.',
      'Explain only the selected problem.',
      'use the provided correct answer as truth.',
      'Break the explanation into tiny steps.',
      'Use short sentences or short bullet points.',
      'Keep the language simple and grade-appropriate.',
      'Let the student do the next small step before moving on when possible.',
      'Do not give long dense paragraphs unless the student asks for more detail.',
      'Ask at most one follow-up question at a time.',
      'If uncertain, say so simply instead of guessing.',
    ].join(' '),
    user: [
      `Grade: ${request.grade}`,
      `Problem type: ${request.problemType}`,
      `Problem: ${request.problemDisplay}`,
      `Correct answer: ${request.correctAnswer}`,
      `Student answer: ${request.studentAnswer ?? 'No answer given'}`,
      `Mental math guide: ${guideSummary || 'none'}`,
      formatTutorMessages(request.messages),
    ].join('\n'),
  };
}
