import { describe, expect, it } from 'vitest';
import { generateOrderOfOperations } from './orderOfOperations';

const ORDER_OF_OPERATIONS_PATTERN = /^(\d+)² \+ (\d+) \+ (\d+) × (\d+) =$/;

describe('generateOrderOfOperations', () => {
  it('always uses the form a² + b + c × d with a correct answer', () => {
    for (let i = 0; i < 200; i += 1) {
      const problem = generateOrderOfOperations();
      const match = problem.display.match(ORDER_OF_OPERATIONS_PATTERN);

      expect(match, `unexpected display: ${problem.display}`).not.toBeNull();

      const [, base, addend, multiplierLeft, multiplierRight] = match!;
      const expectedAnswer =
        Number(base) * Number(base) +
        Number(addend) +
        Number(multiplierLeft) * Number(multiplierRight);

      expect(problem.answer).toBe(expectedAnswer);
      expect(problem.type).toBe('orderOfOperations');
    }
  });
});
