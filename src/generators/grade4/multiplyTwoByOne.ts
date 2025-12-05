import { Problem } from '../../types';

export function generateMultiplyTwoByOne(): Problem {
  // Generate two-digit by one-digit multiplication
  // e.g., 46 x 7 =

  // Two-digit number: 10-99
  const twoDigit = Math.floor(Math.random() * 90) + 10;

  // One-digit number: 2-9 (avoid 0 and 1 as they're trivial)
  const oneDigit = Math.floor(Math.random() * 8) + 2;

  const answer = twoDigit * oneDigit;

  return {
    id: crypto.randomUUID(),
    display: `${twoDigit} × ${oneDigit} =`,
    answer,
    type: 'multiplyTwoByOne',
    typeName: 'Multiplication'
  };
}
