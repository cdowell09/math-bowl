import type { MentalMathGuide } from '../../types/mentalMath';
import { grade1MentalMathGuides } from './grade1';
import { grade2MentalMathGuides } from './grade2';
import { grade3MentalMathGuides } from './grade3';
import { grade4MentalMathGuides } from './grade4';
import { grade5MentalMathGuides } from './grade5';

export const mentalMathGuides: MentalMathGuide[] = [
  ...grade1MentalMathGuides,
  ...grade2MentalMathGuides,
  ...grade3MentalMathGuides,
  ...grade4MentalMathGuides,
  ...grade5MentalMathGuides,
];
