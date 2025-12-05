import { GradeConfig } from '../../types';
import { generatePattern } from '../../generators/grade1/patterns';
import { generateFourOperations } from '../../generators/grade1/fourOperations';
import { generateAddTwoDigit } from '../../generators/grade1/addTwoDigit';
import { generateSubtractTwoDigit } from '../../generators/grade1/subtractTwoDigit';

export const grade1: GradeConfig = {
  grade: 1,
  name: 'Grade 1',
  problemTypes: [
    {
      id: 'patterns',
      name: 'Patterns',
      description: 'Find the next number in the pattern',
      generate: generatePattern
    },
    {
      id: 'fourOperations',
      name: 'Add & Subtract',
      description: 'Add and subtract four numbers',
      generate: generateFourOperations
    },
    {
      id: 'addTwoDigit',
      name: 'Addition',
      description: 'Add two 2-digit numbers',
      generate: generateAddTwoDigit
    },
    {
      id: 'subtractTwoDigit',
      name: 'Subtraction',
      description: 'Subtract two 2-digit numbers',
      generate: generateSubtractTwoDigit
    }
  ]
};
