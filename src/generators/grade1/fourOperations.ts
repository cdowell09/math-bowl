import { Problem } from '../../types';

export function generateFourOperations(): Problem {
  // Generate problems like: 3 + 8 - 5 + 9 =
  const nums: number[] = [];
  const ops: string[] = [];

  for (let i = 0; i < 4; i++) {
    nums.push(Math.floor(Math.random() * 9) + 1); // 1-9
  }

  // Build operators while keeping the running total non-negative
  let answer = nums[0];
  for (let i = 0; i < 3; i++) {
    const nextNum = nums[i + 1];
    const randomOp = Math.random() > 0.5 ? '+' : '-';
    const op = randomOp === '-' && answer - nextNum < 0 ? '+' : randomOp;

    ops.push(op);

    if (op === '+') {
      answer += nextNum;
    } else {
      answer -= nextNum;
    }
  }

  // Build display string
  let display = `${nums[0]}`;
  for (let i = 0; i < 3; i++) {
    display += ` ${ops[i]} ${nums[i + 1]}`;
  }
  display += ' =';

  return {
    id: crypto.randomUUID(),
    display,
    answer,
    type: 'fourOperations',
    typeName: 'Add & Subtract'
  };
}
