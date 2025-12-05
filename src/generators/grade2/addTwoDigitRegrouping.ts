import { Problem } from '../../types';

export function generateAddTwoDigitRegrouping(): Problem {
  // Generate two-digit addition WITH regrouping
  // e.g., 54 + 28 = (ones digits sum >= 10)

  let a: number, b: number;

  do {
    const a1 = Math.floor(Math.random() * 8) + 1; // tens: 1-8
    const a2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9
    const b1 = Math.floor(Math.random() * 8) + 1; // tens: 1-8
    const b2 = Math.floor(Math.random() * 9) + 1; // ones: 1-9

    a = a1 * 10 + a2;
    b = b1 * 10 + b2;
  } while (
    (a % 10) + (b % 10) < 10 || // ones must regroup
    a + b >= 100 // keep sum under 100 for grade 2
  );

  return {
    id: crypto.randomUUID(),
    display: `${a} + ${b} =`,
    answer: a + b,
    type: 'addTwoDigitRegrouping',
    typeName: 'Addition (Regrouping)'
  };
}
