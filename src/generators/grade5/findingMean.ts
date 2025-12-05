import { Problem } from '../../types';

export function generateFindingMean(): Problem {
  // Finding the mean (average)
  // e.g., Find the mean: 4, 9, 8, 4, 6

  // Generate 4-6 numbers that will have an integer average
  const count = Math.floor(Math.random() * 3) + 4; // 4-6 numbers

  // Generate a target mean first, then build numbers around it
  const targetMean = Math.floor(Math.random() * 15) + 3; // 3-17

  // Start with numbers that sum to (count * targetMean)
  const targetSum = count * targetMean;

  // Generate random numbers that sum to targetSum
  const numbers: number[] = [];
  let remainingSum = targetSum;

  for (let i = 0; i < count - 1; i++) {
    // For each number except the last, pick a random value
    // that leaves room for remaining numbers to be positive
    const minRemaining = count - i - 1; // at least 1 for each remaining number
    const maxValue = Math.min(remainingSum - minRemaining, 20);
    const minValue = 1;

    if (maxValue <= minValue) {
      numbers.push(minValue);
      remainingSum -= minValue;
    } else {
      const value = Math.floor(Math.random() * (maxValue - minValue)) + minValue;
      numbers.push(value);
      remainingSum -= value;
    }
  }

  // Last number is whatever's left
  numbers.push(remainingSum);

  // Shuffle the numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const display = `Find the mean: ${numbers.join(', ')}`;

  return {
    id: crypto.randomUUID(),
    display,
    answer: targetMean,
    type: 'findingMean',
    typeName: 'Finding the Mean'
  };
}
