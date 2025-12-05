import { GradeConfig } from '../../types';
import { generateOrderOfOperations } from '../../generators/grade5/orderOfOperations';
import { generateEquationsDecimals } from '../../generators/grade5/equationsDecimals';
import { generateFindingMean } from '../../generators/grade5/findingMean';
import { generateSolvingForX } from '../../generators/grade5/solvingForX';

export const grade5: GradeConfig = {
  grade: 5,
  name: 'Grade 5',
  problemTypes: [
    {
      id: 'orderOfOperations',
      name: 'Order of Operations',
      description: 'Expressions with exponents and mixed operations',
      generate: generateOrderOfOperations
    },
    {
      id: 'equationsDecimals',
      name: 'Equations (Decimals)',
      description: 'Solve for N with positive/negative decimals',
      generate: generateEquationsDecimals
    },
    {
      id: 'findingMean',
      name: 'Finding the Mean',
      description: 'Calculate the average of a set of numbers',
      generate: generateFindingMean
    },
    {
      id: 'solvingForX',
      name: 'Solving for x',
      description: 'Solve linear equations for x',
      generate: generateSolvingForX
    }
  ]
};
