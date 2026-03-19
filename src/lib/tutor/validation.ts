import type { TutorMessage, TutorRequest } from '../../types/tutor';

function isTutorRole(value: unknown): value is TutorMessage['role'] {
  return value === 'user' || value === 'assistant';
}

export function validateTutorRequest(input: unknown): TutorRequest {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid tutor request');
  }

  const request = input as Record<string, unknown>;

  const grade = request.grade;
  if (typeof grade !== 'number' || !Number.isFinite(grade) || grade < 1 || grade > 5) {
    throw new Error('Invalid grade');
  }

  if (typeof request.problemType !== 'string' || request.problemType.trim() === '') {
    throw new Error('Invalid problem type');
  }

  if (typeof request.problemDisplay !== 'string' || request.problemDisplay.trim() === '') {
    throw new Error('Invalid problem display');
  }

  const correctAnswer = request.correctAnswer;
  if (typeof correctAnswer !== 'number' || !Number.isFinite(correctAnswer)) {
    throw new Error('Invalid correct answer');
  }

  const studentAnswer = request.studentAnswer;
  if (
    studentAnswer !== null &&
    studentAnswer !== undefined &&
    (typeof studentAnswer !== 'number' || !Number.isFinite(studentAnswer))
  ) {
    throw new Error('Invalid student answer');
  }

  if (!Array.isArray(request.messages)) {
    throw new Error('Invalid tutor messages');
  }

  const messages = request.messages.map((message) => {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid tutor message');
    }

    const normalized = message as Record<string, unknown>;
    if (!isTutorRole(normalized.role)) {
      throw new Error('Invalid tutor message role');
    }

    if (typeof normalized.content !== 'string') {
      throw new Error('Invalid tutor message content');
    }

    return {
      role: normalized.role,
      content: normalized.content,
    };
  });

  return {
    grade,
    problemType: request.problemType,
    problemDisplay: request.problemDisplay,
    correctAnswer,
    studentAnswer: typeof studentAnswer === 'number' ? studentAnswer : null,
    messages,
  };
}
