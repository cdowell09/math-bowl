import { Problem } from '../../types';

export function generateShortDivision(): Problem {
  // Short division with no remainders (e.g., 256 ÷ 4 =)
  // Generate a divisor (2-9) and ensure the dividend divides evenly

  const divisors = [2, 3, 4, 5, 6, 7, 8, 9];
  const divisor = divisors[Math.floor(Math.random() * divisors.length)];

  // Generate a quotient that gives us a 2-3 digit dividend
  const minQuotient = Math.ceil(10 / divisor); // At least 2-digit dividend
  const maxQuotient = Math.floor(999 / divisor); // At most 3-digit dividend

  const quotient = Math.floor(Math.random() * (maxQuotient - minQuotient + 1)) + minQuotient;
  const dividend = quotient * divisor;

  return {
    id: crypto.randomUUID(),
    display: `${dividend} ÷ ${divisor} =`,
    answer: quotient,
    type: 'shortDivision',
    typeName: 'Short Division'
  };
}
