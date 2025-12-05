import { Problem, ProblemType, GradeConfig } from '../types';
import { Worksheet, WorksheetConfig, WorksheetProblemCount } from '../types/worksheet';

export const PROBLEM_COUNT_OPTIONS: WorksheetProblemCount[] = [5, 10, 15, 20];

export function generateWorksheet(config: WorksheetConfig): Worksheet {
  const { grade, problemType, problemCount, includeAnswerKey } = config;

  const problems = Array.from({ length: problemCount }, () => problemType.generate());

  return {
    id: crypto.randomUUID(),
    title: `${grade.name} - ${problemType.name}`,
    gradeName: grade.name,
    problemTypeName: problemType.name,
    problems,
    includeAnswerKey,
  };
}

export function createWorksheetFromProblems(
  grade: GradeConfig,
  problemType: ProblemType,
  problems: Problem[],
  includeAnswerKey: boolean
): Worksheet {
  return {
    id: crypto.randomUUID(),
    title: `${grade.name} - ${problemType.name}`,
    gradeName: grade.name,
    problemTypeName: problemType.name,
    problems: [...problems],
    includeAnswerKey,
  };
}
