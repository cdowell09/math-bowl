export type TimerMode = 'none' | 'per-problem' | 'total-quiz';

export interface TimerConfig {
  mode: TimerMode;
  secondsPerProblem: number;
  totalMinutes: number;
}

export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  mode: 'none',
  secondsPerProblem: 30,
  totalMinutes: 5,
};

export interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  currentProblemIndex: number;
  problemStartTimes: number[];
  problemDurations: number[];
}

export interface TimedQuizResults {
  totalTime: number;
  timePerProblem: number[];
  averagePace: number;
  timedOutProblems: number[];
}
