import { Problem } from '../../types';

export function generateDecimals(): Problem {
  // Generate adding & subtracting decimals
  // e.g., 1.5 + 2.75 =

  const isAddition = Math.random() < 0.5;

  // Generate decimals with 1 or 2 decimal places
  const decimalPlaces1 = Math.random() < 0.5 ? 1 : 2;
  const decimalPlaces2 = Math.random() < 0.5 ? 1 : 2;

  // Generate numbers: whole part 0-9, decimal part based on places
  const whole1 = Math.floor(Math.random() * 10);
  const decimal1 = decimalPlaces1 === 1
    ? (Math.floor(Math.random() * 9) + 1) / 10  // 0.1 to 0.9
    : (Math.floor(Math.random() * 99) + 1) / 100;  // 0.01 to 0.99
  const a = whole1 + decimal1;

  const whole2 = Math.floor(Math.random() * 10);
  const decimal2 = decimalPlaces2 === 1
    ? (Math.floor(Math.random() * 9) + 1) / 10
    : (Math.floor(Math.random() * 99) + 1) / 100;
  const b = whole2 + decimal2;

  let answer: number;
  let display: string;

  // Format numbers for display
  const formatNum = (n: number): string => {
    // Round to avoid floating point errors, then format
    const rounded = Math.round(n * 100) / 100;
    return rounded.toString();
  };

  if (isAddition) {
    answer = Math.round((a + b) * 100) / 100;
    display = `${formatNum(a)} + ${formatNum(b)} =`;
  } else {
    // For subtraction, ensure a >= b for positive result
    const larger = Math.max(a, b);
    const smaller = Math.min(a, b);
    answer = Math.round((larger - smaller) * 100) / 100;
    display = `${formatNum(larger)} - ${formatNum(smaller)} =`;
  }

  return {
    id: crypto.randomUUID(),
    display,
    answer,
    type: 'decimals',
    typeName: 'Decimals'
  };
}
