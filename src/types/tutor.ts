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
  summary?: string | null;
  hint?: string | null;
  nextQuestion?: string | null;
  workedExample?: string | null;
  messages: TutorMessage[];
}
