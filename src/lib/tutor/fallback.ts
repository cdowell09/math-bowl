import type { TutorRequest, TutorResponse } from '../../types/tutor';

function fallbackResponse(...parts: string[]): TutorResponse {
  return {
    mode: 'fallback',
    fallbackReason: null,
    messages: [{ role: 'assistant', content: parts.join('\n\n') }],
  };
}

function buildPatternFallback(request: TutorRequest): TutorResponse | null {
  const values = Array.from(
    request.problemDisplay.matchAll(/-?\d+(?:\.\d+)?/g),
    (match) => Number(match[0])
  );
  if (values.length < 3) return null;

  const step = values[1] - values[0];
  if (!values.slice(1).every((value, index) => Math.abs(value - values[index] - step) < 0.001)) {
    return null;
  }

  const direction = step < 0 ? 'down' : 'up';
  const stepSize = Math.abs(step);
  const lastVisible = values[values.length - 1];

  return fallbackResponse(
    `Look at how the numbers change each time. They go ${direction} by ${stepSize}, so after ${lastVisible} the next number is ${request.correctAnswer}.`,
    `Hint: ${values[0]} to ${values[1]} changes by ${step < 0 ? '-' : '+'}${stepSize}. Check whether the next pair changes by the same amount.`,
    `If the pattern keeps going ${direction} by ${stepSize}, what should come after ${lastVisible}?`
  );
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
    return fallbackResponse(
      `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      `Hint: If you subtract ${b} from ${c}, what do you get?`,
      `After you get ${a}x = ${afterSubtract}, what is ${afterSubtract} divided by ${a}?`
    );
  }

  const axMinusB = display.match(/^(\d+)x - (\d+) = (\d+)$/);
  if (axMinusB) {
    const [, aText, bText, cText] = axMinusB;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterAdd = c + b;
    return fallbackResponse(
      `Start by undoing the - ${b}. Add ${b} to both sides so ${a}x = ${afterAdd}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      `Hint: If you add ${b} to ${c}, what do you get?`,
      `After you get ${a}x = ${afterAdd}, what is ${afterAdd} divided by ${a}?`
    );
  }

  const bPlusAx = display.match(/^(\d+) \+ (\d+)x = (\d+)$/);
  if (bPlusAx) {
    const [, bText, aText, cText] = bPlusAx;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterSubtract = c - b;
    return fallbackResponse(
      `Start by undoing the + ${b}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      `Hint: What is ${c} - ${b}?`,
      `After that, what is ${afterSubtract} divided by ${a}?`
    );
  }

  const cEqualsAxPlusB = display.match(/^(\d+) = (\d+)x \+ (\d+)$/);
  if (cEqualsAxPlusB) {
    const [, cText, aText, bText] = cEqualsAxPlusB;
    const a = Number(aText);
    const b = Number(bText);
    const c = Number(cText);
    const afterSubtract = c - b;
    return fallbackResponse(
      `Think of ${c} = ${a}x + ${b} as ${a}x + ${b} = ${c}. Subtract ${b} from both sides so ${a}x = ${afterSubtract}. Then divide both sides by ${a}, so x = ${request.correctAnswer}.`,
      `Hint: What is ${c} - ${b}?`,
      `After you get ${a}x = ${afterSubtract}, what is ${afterSubtract} divided by ${a}?`
    );
  }

  return null;
}

export function buildTutorFallback(request: TutorRequest): TutorResponse {
  const problemType = request.problemType.trim().toLowerCase();
  const specificFallback = problemType.includes('pattern')
    ? buildPatternFallback(request)
    : problemType.includes('solving for x')
      ? buildSolvingForXFallback(request)
      : null;

  return specificFallback ?? fallbackResponse(
    `I'm having trouble explaining this one right now, but the correct answer is ${request.correctAnswer}.`,
    'Hint: Try comparing your answer to the correct answer one small step at a time.',
    `What part of ${request.problemDisplay} feels the trickiest?`
  );
}
