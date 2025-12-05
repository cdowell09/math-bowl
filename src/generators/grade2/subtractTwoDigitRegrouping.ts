import { Problem } from '../../types';

export function generateSubtractTwoDigitRegrouping(): Problem {
  // Generate two-digit subtraction WITH regrouping (borrowing)
  // e.g., 72 - 35 = (ones digit of first < ones digit of second)

  let a: number, b: number;

  do {
    const a1 = Math.floor(Math.random() * 7) + 3; // tens: 3-9 (need room to borrow)
    const a2 = Math.floor(Math.random() * 8); // ones: 0-7 (smaller to force borrowing)
    const b1 = Math.floor(Math.random() * 7) + 1; // tens: 1-7
    const b2 = Math.floor(Math.random() * 8) + 2; // ones: 2-9 (larger to force borrowing)

    a = a1 * 10 + a2;
    b = b1 * 10 + b2;
  } while (
    (a % 10) >= (b % 10) || // ones must require borrowing
    a <= b || // result must be positive
    Math.floor(a / 10) <= Math.floor(b / 10) // tens must allow for borrowing
  );

  return {
    id: crypto.randomUUID(),
    display: `${a} - ${b} =`,
    answer: a - b,
    type: 'subtractTwoDigitRegrouping',
    typeName: 'Subtraction (Regrouping)'
  };
}
