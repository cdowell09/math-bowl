import { Problem } from '../../types';

export function generateFourOperations(): Problem {
  // Generate problems like: 3 + 8 - 5 + 9 =
  const nums: number[] = [];
  const ops: string[] = [];

  for (let i = 0; i < 4; i++) {
    nums.push(Math.floor(Math.random() * 9) + 1); // 1-9
  }

  for (let i = 0; i < 3; i++) {
    ops.push(Math.random() > 0.5 ? '+' : '-');
  }

  // Calculate answer
  let answer = nums[0];
  for (let i = 0; i < 3; i++) {
    if (ops[i] === '+') {
      answer += nums[i + 1];
    } else {
      answer -= nums[i + 1];
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
