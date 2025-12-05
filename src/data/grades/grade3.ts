import { GradeConfig } from '../../types';
import { generateShortDivision } from '../../generators/grade3/shortDivision';
import { generateMetricConversion } from '../../generators/grade3/metricConversions';
import { generateEquationsWithRegrouping } from '../../generators/grade3/equationsWithRegrouping';
import { generateMixedMultiplicationAddition } from '../../generators/grade3/mixedMultiplicationAddition';

export const grade3: GradeConfig = {
  grade: 3,
  name: 'Grade 3',
  problemTypes: [
    {
      id: 'shortDivision',
      name: 'Short Division',
      description: 'Division with no remainders',
      generate: generateShortDivision
    },
    {
      id: 'metricConversions',
      name: 'Metric Conversions',
      description: 'Convert between metric units',
      generate: generateMetricConversion
    },
    {
      id: 'equationsWithRegrouping',
      name: 'Equations (Regrouping)',
      description: 'Solve for N with regrouping',
      generate: generateEquationsWithRegrouping
    },
    {
      id: 'mixedMultiplicationAddition',
      name: 'Mixed Operations',
      description: 'Multiplication and addition combined',
      generate: generateMixedMultiplicationAddition
    }
  ]
};
