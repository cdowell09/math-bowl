import { Problem, ProblemType, GradeConfig } from './index';

export type WorksheetProblemCount = 5 | 10 | 15 | 20;

export interface WorksheetConfig {
  grade: GradeConfig;
  problemType: ProblemType;
  problemCount: WorksheetProblemCount;
  includeAnswerKey: boolean;
}

export interface Worksheet {
  id: string;
  title: string;
  gradeName: string;
  problemTypeName: string;
  problems: Problem[];
  includeAnswerKey: boolean;
}

export type WorksheetModalContext =
  | { source: 'problemTypeSelector'; grade: GradeConfig; problemType: ProblemType }
  | { source: 'results'; grade: GradeConfig; problemType: ProblemType; existingProblems?: Problem[] };
