import { Problem } from '../../types';

export function generateEquationsNegative(): Problem {
  // Generate equations with negative numbers
  // e.g., N + -14 = -25 (solve for N)

  // Randomly choose equation type
  const type = Math.floor(Math.random() * 4);

  let n: number, b: number, c: number;
  let display: string;

  switch (type) {
    case 0:
      // N + negative = negative (where N is negative)
      // e.g., N + -14 = -25, so N = -11
      b = -(Math.floor(Math.random() * 20) + 5); // -5 to -24
      n = -(Math.floor(Math.random() * 20) + 1); // -1 to -20
      c = n + b;
      display = `N + ${b} = ${c}`;
      break;

    case 1:
      // N + negative = positive (where N is positive and larger than |b|)
      // e.g., N + -8 = 7, so N = 15
      b = -(Math.floor(Math.random() * 15) + 3); // -3 to -17
      c = Math.floor(Math.random() * 15) + 1; // 1 to 15
      n = c - b; // N = c - b (subtracting negative = adding)
      display = `N + ${b} = ${c}`;
      break;

    case 2:
      // N - negative = result (subtracting negative)
      // e.g., N - -12 = 20, so N = 8
      b = -(Math.floor(Math.random() * 15) + 5); // -5 to -19
      c = Math.floor(Math.random() * 25) + 10; // 10 to 34
      n = c + b; // N = c + b (since N - (-b) = c means N + b = c)
      display = `N - (${b}) = ${c}`;
      break;

    default:
      // negative + N = result
      // e.g., -14 + N = -25, so N = -11
      b = -(Math.floor(Math.random() * 20) + 5); // -5 to -24
      c = -(Math.floor(Math.random() * 30) + 10); // -10 to -39
      n = c - b;
      display = `${b} + N = ${c}`;
      break;
  }

  return {
    id: crypto.randomUUID(),
    display,
    answer: n,
    type: 'equationsNegative',
    typeName: 'Equations (Negative)'
  };
}
