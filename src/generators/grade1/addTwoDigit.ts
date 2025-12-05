import { Problem } from '../../types';

export function generateAddTwoDigit(): Problem {
  // Generate two-digit addition WITHOUT regrouping
  // e.g., 63 + 22 = (ones digits sum < 10, tens digits sum < 10)

  let a: number, b: number;

  do {
    const a1 = Math.floor(Math.random() * 8) + 1; // tens: 1-8
    const a2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9
    const b1 = Math.floor(Math.random() * 8) + 1; // tens: 1-8
    const b2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9

    a = a1 * 10 + a2;
    b = b1 * 10 + b2;
  } while (
    (a % 10) + (b % 10) >= 10 || // ones would regroup
    Math.floor(a / 10) + Math.floor(b / 10) >= 10 // tens would regroup
  );

  return {
    id: crypto.randomUUID(),
    display: `${a} + ${b} =`,
    answer: a + b,
    type: 'addTwoDigit',
    typeName: 'Addition'
  };
}
