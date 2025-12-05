import { Problem } from '../../types';

export function generateMixedMultiplicationAddition(): Problem {
  // Multiplication & addition mixed (e.g., 4 x 7 + 3 x 5 =)
  // Generate two multiplication expressions and add them

  const a1 = Math.floor(Math.random() * 9) + 2; // 2-10
  const a2 = Math.floor(Math.random() * 9) + 2; // 2-10
  const b1 = Math.floor(Math.random() * 9) + 2; // 2-10
  const b2 = Math.floor(Math.random() * 9) + 2; // 2-10

  const product1 = a1 * a2;
  const product2 = b1 * b2;
  const answer = product1 + product2;

  return {
    id: crypto.randomUUID(),
    display: `${a1} × ${a2} + ${b1} × ${b2} =`,
    answer: answer,
    type: 'mixedMultiplicationAddition',
    typeName: 'Mixed Operations'
  };
}
