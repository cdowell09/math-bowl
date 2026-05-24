import type { MentalMathGuide } from '../../types/mentalMath';
import { grade1MentalMathGuides } from './grade1.js';
import { grade2MentalMathGuides } from './grade2.js';
import { grade3MentalMathGuides } from './grade3.js';
import { grade4MentalMathGuides } from './grade4.js';
import { grade5MentalMathGuides } from './grade5.js';

export const mentalMathGuides: MentalMathGuide[] = [
  ...grade1MentalMathGuides,
  ...grade2MentalMathGuides,
  ...grade3MentalMathGuides,
  ...grade4MentalMathGuides,
  ...grade5MentalMathGuides,
];
