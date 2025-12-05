import { Problem } from '../../types';

export function generateSolvingForX(): Problem {
  // Solving for x in linear equations
  // e.g., 4x + 5 = 41

  const type = Math.floor(Math.random() * 4);

  let x: number;
  let display: string;

  switch (type) {
    case 0: {
      // ax + b = c (solve for x)
      // e.g., 4x + 5 = 41, so x = 9
      const a = Math.floor(Math.random() * 8) + 2; // 2-9
      x = Math.floor(Math.random() * 10) + 2; // 2-11
      const b = Math.floor(Math.random() * 15) + 1; // 1-15
      const c = a * x + b;
      display = `${a}x + ${b} = ${c}`;
      break;
    }

    case 1: {
      // ax - b = c (solve for x)
      // e.g., 5x - 7 = 18, so x = 5
      const a = Math.floor(Math.random() * 7) + 2; // 2-8
      x = Math.floor(Math.random() * 10) + 3; // 3-12
      const b = Math.floor(Math.random() * 10) + 1; // 1-10
      const c = a * x - b;
      display = `${a}x - ${b} = ${c}`;
      break;
    }

    case 2: {
      // b + ax = c (solve for x)
      // e.g., 8 + 3x = 23, so x = 5
      const a = Math.floor(Math.random() * 7) + 2; // 2-8
      x = Math.floor(Math.random() * 10) + 2; // 2-11
      const b = Math.floor(Math.random() * 15) + 1; // 1-15
      const c = b + a * x;
      display = `${b} + ${a}x = ${c}`;
      break;
    }

    default: {
      // c = ax + b (solve for x, reversed format)
      // e.g., 35 = 6x + 5, so x = 5
      const a = Math.floor(Math.random() * 7) + 2; // 2-8
      x = Math.floor(Math.random() * 10) + 2; // 2-11
      const b = Math.floor(Math.random() * 10) + 1; // 1-10
      const c = a * x + b;
      display = `${c} = ${a}x + ${b}`;
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    display,
    answer: x,
    type: 'solvingForX',
    typeName: 'Solving for x'
  };
}
