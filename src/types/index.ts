export interface Problem {
  id: string;
  display: string;
  answer: number;
  type: string;
  typeName: string;
}

export interface ProblemType {
  id: string;
  name: string;
  description: string;
  generate: () => Problem;
}

export interface GradeConfig {
  grade: number;
  name: string;
  problemTypes: ProblemType[];
}
