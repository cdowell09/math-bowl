import { Problem } from '../../types';

export function generateSubtractTwoDigit(): Problem {
  // Generate two-digit subtraction WITHOUT regrouping
  // e.g., 67 - 44 = (ones: first >= second, tens: first >= second)

  let a: number, b: number;

  do {
    const a1 = Math.floor(Math.random() * 8) + 2; // tens: 2-9
    const a2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9
    const b1 = Math.floor(Math.random() * 8) + 1; // tens: 1-8
    const b2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9

    a = a1 * 10 + a2;
    b = b1 * 10 + b2;
  } while (
    (a % 10) < (b % 10) || // ones would need borrowing
    Math.floor(a / 10) < Math.floor(b / 10) // tens would go negative
  );

  return {
    id: crypto.randomUUID(),
    display: `${a} - ${b} =`,
    answer: a - b,
    type: 'subtractTwoDigit',
    typeName: 'Subtraction'
  };
}
