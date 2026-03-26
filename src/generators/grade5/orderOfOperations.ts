import { Problem } from '../../types';

export function generateOrderOfOperations(): Problem {
  // Grade 5 Order of Operations should always be: a² + b + c × d
  const base = Math.floor(Math.random() * 8) + 2; // 2-9
  const addend = Math.floor(Math.random() * 10) + 1; // 1-10
  const multiplierLeft = Math.floor(Math.random() * 8) + 2; // 2-9
  const multiplierRight = Math.floor(Math.random() * 8) + 2; // 2-9
  const answer = base * base + addend + multiplierLeft * multiplierRight;
  const display = `${base}² + ${addend} + ${multiplierLeft} × ${multiplierRight} =`;

  return {
    id: crypto.randomUUID(),
    display,
    answer,
    type: 'orderOfOperations',
    typeName: 'Order of Operations'
  };
}
