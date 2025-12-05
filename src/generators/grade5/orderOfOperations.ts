import { Problem } from '../../types';

export function generateOrderOfOperations(): Problem {
  // Order of operations with exponents
  // e.g., 8² + 6 + 2 x 3 =
  // Following PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction

  const type = Math.floor(Math.random() * 4);

  let display: string;
  let answer: number;

  switch (type) {
    case 0: {
      // base² + a + b × c
      const base = Math.floor(Math.random() * 8) + 2; // 2-9
      const a = Math.floor(Math.random() * 10) + 1; // 1-10
      const b = Math.floor(Math.random() * 8) + 2; // 2-9
      const c = Math.floor(Math.random() * 8) + 2; // 2-9
      answer = base * base + a + b * c;
      display = `${base}² + ${a} + ${b} × ${c} =`;
      break;
    }

    case 1: {
      // base² - a × b
      const base = Math.floor(Math.random() * 8) + 4; // 4-11 (larger to ensure positive result)
      const a = Math.floor(Math.random() * 5) + 2; // 2-6
      const b = Math.floor(Math.random() * 5) + 2; // 2-6
      // Ensure positive result
      const product = a * b;
      const squared = base * base;
      if (squared > product) {
        answer = squared - product;
        display = `${base}² - ${a} × ${b} =`;
      } else {
        answer = squared + product;
        display = `${base}² + ${a} × ${b} =`;
      }
      break;
    }

    case 2: {
      // a × b + c² - d
      const a = Math.floor(Math.random() * 6) + 2; // 2-7
      const b = Math.floor(Math.random() * 6) + 2; // 2-7
      const base = Math.floor(Math.random() * 6) + 2; // 2-7
      const d = Math.floor(Math.random() * 10) + 1; // 1-10
      answer = a * b + base * base - d;
      display = `${a} × ${b} + ${base}² - ${d} =`;
      break;
    }

    default: {
      // base² ÷ a + b (where base² is divisible by a)
      const a = Math.floor(Math.random() * 6) + 2; // 2-7
      const quotient = Math.floor(Math.random() * 8) + 2; // 2-9
      // Find a base whose square divided by a gives quotient
      // base² = a × quotient, so we need a perfect square
      const squared = a * quotient;
      const base = Math.sqrt(squared);
      if (Number.isInteger(base)) {
        const b = Math.floor(Math.random() * 15) + 1;
        answer = quotient + b;
        display = `${base}² ÷ ${a} + ${b} =`;
      } else {
        // Fallback: simpler expression
        const newBase = Math.floor(Math.random() * 7) + 3; // 3-9
        const newB = Math.floor(Math.random() * 10) + 1;
        answer = newBase * newBase + newB;
        display = `${newBase}² + ${newB} =`;
      }
      break;
    }
  }

  return {
    id: crypto.randomUUID(),
    display,
    answer,
    type: 'orderOfOperations',
    typeName: 'Order of Operations'
  };
}
