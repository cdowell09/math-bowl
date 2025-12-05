import { Problem } from '../../types';

export function generateAddingMoney(): Problem {
  // Generate money counting problems
  // e.g., 1Q, 1D, 3N, 1P → calculate total cents
  // Q = quarter (25¢), D = dime (10¢), N = nickel (5¢), P = penny (1¢)

  const quarters = Math.floor(Math.random() * 4); // 0-3 quarters
  const dimes = Math.floor(Math.random() * 5); // 0-4 dimes
  const nickels = Math.floor(Math.random() * 5); // 0-4 nickels
  const pennies = Math.floor(Math.random() * 5); // 0-4 pennies

  // Ensure at least 2 different coin types and at least 2 total coins
  const totalCoins = quarters + dimes + nickels + pennies;
  const coinTypes = [quarters, dimes, nickels, pennies].filter(c => c > 0).length;

  if (totalCoins < 2 || coinTypes < 2) {
    return generateAddingMoney(); // Regenerate if too simple
  }

  const total = quarters * 25 + dimes * 10 + nickels * 5 + pennies;

  // Build display string with only non-zero coin counts
  const parts: string[] = [];
  if (quarters > 0) parts.push(`${quarters}Q`);
  if (dimes > 0) parts.push(`${dimes}D`);
  if (nickels > 0) parts.push(`${nickels}N`);
  if (pennies > 0) parts.push(`${pennies}P`);

  return {
    id: crypto.randomUUID(),
    display: `${parts.join(', ')} = ___ ¢`,
    answer: total,
    type: 'addingMoney',
    typeName: 'Adding Money'
  };
}
