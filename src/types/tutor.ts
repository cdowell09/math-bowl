export type TutorRole = 'user' | 'assistant';

export interface TutorMessage {
  role: TutorRole;
  content: string;
}

export interface TutorRequest {
  grade: number;
  problemType: string;
  problemDisplay: string;
  correctAnswer: number;
  studentAnswer: number | null;
  messages: TutorMessage[];
}

export interface TutorResponse {
  summary?: string;
  hint?: string;
  nextQuestion?: string;
  workedExample?: string | null;
  messages: TutorMessage[];
}
