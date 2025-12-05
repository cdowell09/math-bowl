import { Problem } from '../../types';

export function generateEquationsWithRegrouping(): Problem {
  // Equations WITH regrouping (e.g., N + 28 = 73)
  // Unlike Grade 2, these require borrowing or carrying to solve

  const isAddition = Math.random() < 0.5;

  if (isAddition) {
    // N + b = c, where N = c - b (REQUIRES borrowing)
    let b: number, c: number, n: number;

    do {
      c = Math.floor(Math.random() * 50) + 50; // 50-99
      b = Math.floor(Math.random() * 40) + 10; // 10-49
      n = c - b;
    } while (
      n <= 0 ||
      n >= 100 ||
      // Ensure borrowing is required: ones digit of c < ones digit of b
      (c % 10) >= (b % 10)
    );

    return {
      id: crypto.randomUUID(),
      display: `N + ${b} = ${c}`,
      answer: n,
      type: 'equationsWithRegrouping',
      typeName: 'Equations (Regrouping)'
    };
  } else {
    // N - b = c, where N = c + b (REQUIRES carrying)
    let b: number, c: number, n: number;

    do {
      c = Math.floor(Math.random() * 40) + 10; // 10-49
      b = Math.floor(Math.random() * 40) + 10; // 10-49
      n = c + b;
    } while (
      n >= 100 ||
      // Ensure carrying is required: ones digits sum >= 10
      (c % 10) + (b % 10) < 10
    );

    return {
      id: crypto.randomUUID(),
      display: `N - ${b} = ${c}`,
      answer: n,
      type: 'equationsWithRegrouping',
      typeName: 'Equations (Regrouping)'
    };
  }
}
