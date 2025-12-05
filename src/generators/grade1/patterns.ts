import { Problem } from '../../types';

export function generatePattern(): Problem {
  // Generate arithmetic sequences like: 30, 26, 22, 18, ___
  const steps = [2, 3, 4, 5, 6, 8, 9, 10];
  const step = steps[Math.floor(Math.random() * steps.length)];
  const isIncreasing = Math.random() > 0.5;

  // Start value that makes sense
  const start = isIncreasing
    ? Math.floor(Math.random() * 20) + 5  // 5-24 for increasing
    : Math.floor(Math.random() * 40) + 60; // 60-99 for decreasing

  const sequence: number[] = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(start + (isIncreasing ? step * i : -step * i));
  }

  const answer = start + (isIncreasing ? step * 4 : -step * 4);

  return {
    id: crypto.randomUUID(),
    display: `${sequence.join(', ')}, ___`,
    answer,
    type: 'patterns',
    typeName: 'Patterns'
  };
}
