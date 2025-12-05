import { GradeConfig } from '../../types';
import { generateEquationsNegative } from '../../generators/grade4/equationsNegative';
import { generateMultiplyTwoByOne } from '../../generators/grade4/multiplyTwoByOne';
import { generateDecimals } from '../../generators/grade4/decimals';
import { generateElapsedTime } from '../../generators/grade4/elapsedTime';

export const grade4: GradeConfig = {
  grade: 4,
  name: 'Grade 4',
  problemTypes: [
    {
      id: 'equationsNegative',
      name: 'Equations (Negative)',
      description: 'Solve for N with negative numbers',
      generate: generateEquationsNegative
    },
    {
      id: 'multiplyTwoByOne',
      name: 'Multiplication',
      description: 'Multiply two-digit by one-digit numbers',
      generate: generateMultiplyTwoByOne
    },
    {
      id: 'decimals',
      name: 'Decimals',
      description: 'Add and subtract decimal numbers',
      generate: generateDecimals
    },
    {
      id: 'elapsedTime',
      name: 'Elapsed Time',
      description: 'Calculate time between two times (answer in minutes)',
      generate: generateElapsedTime
    }
  ]
};
