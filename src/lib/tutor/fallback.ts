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

function buildSolvingForXFallback(request: TutorRequest): TutorResponse | null {
  const display = request.problemDisplay.replace(/\s+/g, ' ').trim();

  const axPlusB = display.match(/^(\d+)x \+ (\d+) = (\d+)$/);
  if (axPlusB) {
    const [, aText, bText, cText] = axPlusB;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterSubtract = c - b;

    return {
      summary: `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      hint: `If you subtract ${b} from ${c}, what do you get?`,
      nextQuestion: `After you get ${a}x = ${afterSubtract}, what is ${afterSubtract} divided by ${a}?`,
      workedExample: null,
      messages: [
        {
          role: 'assistant',
          content: `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
        },
      ],
    };
  }

  const axMinusB = display.match(/^(\d+)x - (\d+) = (\d+)$/);
  if (axMinusB) {
    const [, aText, bText, cText] = axMinusB;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterAdd = c + b;

    return {
      summary: `Start by undoing the - ${b}. Add ${b} to both sides so ${a}x = ${afterAdd}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      hint: `If you add ${b} to ${c}, what do you get?`,
      nextQuestion: `After you get ${a}x = ${afterAdd}, what is ${afterAdd} divided by ${a}?`,
      workedExample: null,
      messages: [
        {
          role: 'assistant',
          content: `Start by undoing the - ${b}. Add ${b} to both sides so ${a}x = ${afterAdd}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
        },
      ],
    };
  }

  const bPlusAx = display.match(/^(\d+) \+ (\d+)x = (\d+)$/);
  if (bPlusAx) {
    const [, bText, aText, cText] = bPlusAx;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterSubtract = c - b;

    return {
      summary: `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      hint: `What is ${c} - ${b}?`,
      nextQuestion: `After that, what is ${afterSubtract} divided by ${a}?`,
      workedExample: null,
      messages: [
        {
          role: 'assistant',
          content: `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
        },
      ],
    };
  }

  const cEqualsAxPlusB = display.match(/^(\d+) = (\d+)x \+ (\d+)$/);
  if (cEqualsAxPlusB) {
    const [, cText, aText, bText] = cEqualsAxPlusB;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterSubtract = c - b;

    return {
      summary: `Think of ${c} = ${a}x + ${b} as ${a}x + ${b} = ${c}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      hint: `What is ${c} - ${b}?`,
      nextQuestion: `After you get ${a}x = ${afterSubtract}, what is ${afterSubtract} divided by ${a}?`,
      workedExample: null,
      messages: [
        {
          role: 'assistant',
          content: `Think of ${c} = ${a}x + ${b} as ${a}x + ${b} = ${c}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
        },
      ],
    };
  }

  return null;
}

export function buildTutorFallback(request: TutorRequest): TutorResponse {
  const problemType = request.problemType.trim().toLowerCase();
  const patternFallback = problemType.includes('pattern') ? buildPatternFallback(request) : null;
  const solvingForXFallback = problemType.includes('solving for x') ? buildSolvingForXFallback(request) : null;

  if (patternFallback) {
    return patternFallback;
  }

  if (solvingForXFallback) {
    return solvingForXFallback;
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
