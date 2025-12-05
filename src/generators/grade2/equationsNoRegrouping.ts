import { Problem } from '../../types';

export function generateEquationsNoRegrouping(): Problem {
  // Generate equations without regrouping
  // e.g., N + 43 = 95 (solve for N)
  // The equation should not require regrouping when solved

  // Randomly choose addition or subtraction equation type
  const isAddition = Math.random() < 0.5;

  if (isAddition) {
    // N + b = c, where N = c - b (no borrowing needed)
    let b: number, c: number, n: number;

    do {
      const c1 = Math.floor(Math.random() * 7) + 3; // tens: 3-9
      const c2 = Math.floor(Math.random() * 8) + 1; // ones: 1-8
      const b1 = Math.floor(Math.random() * 7) + 1; // tens: 1-7
      const b2 = Math.floor(Math.random() * 8) + 1; // ones: 1-8

      c = c1 * 10 + c2;
      b = b1 * 10 + b2;
      n = c - b;
    } while (
      n <= 0 || // N must be positive
      n >= 100 || // N must be two-digit or less
      (c % 10) < (b % 10) || // no borrowing in ones
      Math.floor(c / 10) < Math.floor(b / 10) // no borrowing in tens
    );

    return {
      id: crypto.randomUUID(),
      display: `N + ${b} = ${c}`,
      answer: n,
      type: 'equationsNoRegrouping',
      typeName: 'Equations'
    };
  } else {
    // N - b = c, where N = c + b (no carrying needed)
    let b: number, c: number, n: number;

    do {
      const c1 = Math.floor(Math.random() * 5) + 1; // tens: 1-5
      const c2 = Math.floor(Math.random() * 5) + 1; // ones: 1-5
      const b1 = Math.floor(Math.random() * 4) + 1; // tens: 1-4
      const b2 = Math.floor(Math.random() * 4) + 1; // ones: 1-4

      c = c1 * 10 + c2;
      b = b1 * 10 + b2;
      n = c + b;
    } while (
      (c % 10) + (b % 10) >= 10 || // no carrying in ones
      Math.floor(c / 10) + Math.floor(b / 10) >= 10 || // no carrying in tens
      n >= 100 // N must be under 100
    );

    return {
      id: crypto.randomUUID(),
      display: `N - ${b} = ${c}`,
      answer: n,
      type: 'equationsNoRegrouping',
      typeName: 'Equations'
    };
  }
}
