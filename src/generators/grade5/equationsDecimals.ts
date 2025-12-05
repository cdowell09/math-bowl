import { Problem } from '../../types';

export function generateEquationsDecimals(): Problem {
  // Equations with positive/negative decimals
  // e.g., N + .3 = -2.7

  const type = Math.floor(Math.random() * 4);

  let n: number;
  let display: string;

  // Helper to format decimals nicely
  const formatDecimal = (num: number): string => {
    const rounded = Math.round(num * 10) / 10;
    return rounded.toString();
  };

  switch (type) {
    case 0: {
      // N + positive = negative (N is negative)
      // e.g., N + 0.3 = -2.7, so N = -3
      const b = (Math.floor(Math.random() * 9) + 1) / 10; // 0.1 to 0.9
      const c = -((Math.floor(Math.random() * 8) + 1) + (Math.floor(Math.random() * 9) + 1) / 10); // -1.1 to -8.9
      n = Math.round((c - b) * 10) / 10;
      display = `N + ${formatDecimal(b)} = ${formatDecimal(c)}`;
      break;
    }

    case 1: {
      // N + negative = result
      // e.g., N + -1.5 = 2.3, so N = 3.8
      const b = -((Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) + 1) / 10); // -1.1 to -5.9
      const c = (Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) + 1) / 10; // 1.1 to 5.9
      n = Math.round((c - b) * 10) / 10;
      display = `N + ${formatDecimal(b)} = ${formatDecimal(c)}`;
      break;
    }

    case 2: {
      // N - positive = negative
      // e.g., N - 1.2 = -3.5, so N = -2.3
      const b = (Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) + 1) / 10; // 1.1 to 5.9
      const c = -((Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) + 1) / 10); // -1.1 to -5.9
      n = Math.round((c + b) * 10) / 10;
      display = `N - ${formatDecimal(b)} = ${formatDecimal(c)}`;
      break;
    }

    default: {
      // negative + N = result
      // e.g., -2.4 + N = 1.6, so N = 4
      const a = -((Math.floor(Math.random() * 5) + 1) + (Math.floor(Math.random() * 9) + 1) / 10); // -1.1 to -5.9
      const c = (Math.floor(Math.random() * 5)) + (Math.floor(Math.random() * 9) + 1) / 10; // 0.1 to 4.9
      n = Math.round((c - a) * 10) / 10;
      display = `${formatDecimal(a)} + N = ${formatDecimal(c)}`;
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    display,
    answer: n,
    type: 'equationsDecimals',
    typeName: 'Equations (Decimals)'
  };
}
