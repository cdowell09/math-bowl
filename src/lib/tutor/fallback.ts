import type { TutorRequest, TutorResponse } from '../../types/tutor';

function parsePatternNumbers(problemDisplay: string): number[] {
  return Array.from(problemDisplay.matchAll(/-?\d+(?:\.\d+)?/g), (match) => Number(match[0]));
}

function buildPatternFallback(request: TutorRequest): TutorResponse | null {
  const values = parsePatternNumbers(request.problemDisplay);
  if (values.length < 3) {
    return null;
  }

  const step = values[1] - values[0];
  const followsPattern = values.slice(1).every((value, index) => Math.abs(value - values[index] - step) < 0.001);
  if (!followsPattern) {
    return null;
  }

  const direction = step < 0 ? 'down' : 'up';
  const stepSize = Math.abs(step);
  const lastVisible = values[values.length - 1];
  const summary = `Look at how the numbers change each time. They go ${direction} by ${stepSize}, so after ${lastVisible} the next number is ${request.correctAnswer}.`;
  const hint = `${values[0]} to ${values[1]} changes by ${step < 0 ? '-' : '+'}${stepSize}. Check whether the next pair changes by the same amount.`;
  const nextQuestion = `If the pattern keeps going ${direction} by ${stepSize}, what should come after ${lastVisible}?`;

  return {
    summary,
    hint,
    nextQuestion,
    workedExample: null,
    messages: [
      {
        role: 'assistant',
        content: `${summary} ${hint} ${nextQuestion}`,
      },
    ],
  };
}

export function buildTutorFallback(request: TutorRequest): TutorResponse {
  const problemType = request.problemType.trim().toLowerCase();
  const patternFallback = problemType.includes('pattern') ? buildPatternFallback(request) : null;

  if (patternFallback) {
    return patternFallback;
  }

  return {
    summary: `I'm having trouble explaining this one right now, but the correct answer is ${request.correctAnswer}.`,
    hint: 'Try comparing your answer to the correct answer one small step at a time.',
    nextQuestion: `What part of ${request.problemDisplay} feels the trickiest?`,
    workedExample: null,
    messages: [
      {
        role: 'assistant',
        content: `I'm having trouble explaining this one right now, but the correct answer is ${request.correctAnswer}. Try comparing your answer to the correct answer one small step at a time.`,
      },
    ],
  };
}
