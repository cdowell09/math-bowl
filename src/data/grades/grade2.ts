import { GradeConfig } from '../../types';
import { generateAddTwoDigitRegrouping } from '../../generators/grade2/addTwoDigitRegrouping';
import { generateSubtractTwoDigitRegrouping } from '../../generators/grade2/subtractTwoDigitRegrouping';
import { generateAddingMoney } from '../../generators/grade2/addingMoney';
import { generateEquationsNoRegrouping } from '../../generators/grade2/equationsNoRegrouping';

export const grade2: GradeConfig = {
  grade: 2,
  name: 'Grade 2',
  problemTypes: [
    {
      id: 'addTwoDigitRegrouping',
      name: 'Addition (Regrouping)',
      description: 'Add two 2-digit numbers with regrouping',
      generate: generateAddTwoDigitRegrouping
    },
    {
      id: 'subtractTwoDigitRegrouping',
      name: 'Subtraction (Regrouping)',
      description: 'Subtract two 2-digit numbers with regrouping',
      generate: generateSubtractTwoDigitRegrouping
    },
    {
      id: 'addingMoney',
      name: 'Adding Money',
      description: 'Count coins (Q=25¢, D=10¢, N=5¢, P=1¢)',
      generate: generateAddingMoney
    },
    {
      id: 'equationsNoRegrouping',
      name: 'Equations',
      description: 'Solve for N without regrouping',
      generate: generateEquationsNoRegrouping
    }
  ]
};
