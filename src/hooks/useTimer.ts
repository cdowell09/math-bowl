import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerConfig, TimerState, TimedQuizResults } from '../types/timer';

interface UseTimerOptions {
  config: TimerConfig;
  problemCount: number;
  onProblemTimeout: (problemIndex: number) => void;
  onQuizTimeout: () => void;
}

export function useTimer({
  config,
  problemCount,
  onProblemTimeout,
  onQuizTimeout,
}: UseTimerOptions) {
  const [state, setState] = useState<TimerState>(() => ({
    timeRemaining: config.mode === 'per-problem'
      ? config.secondsPerProblem
      : config.totalMinutes * 60,
    isRunning: false,
    currentProblemIndex: 0,
    problemStartTimes: [], // Kept for potential future use
    problemDurations: Array(problemCount).fill(0),
  }));

  const intervalRef = useRef<number | null>(null);
  const quizStartTimeRef = useRef<number>(0);
  const problemStartTimeRef = useRef<number>(0);
  const onProblemTimeoutRef = useRef(onProblemTimeout);
  const onQuizTimeoutRef = useRef(onQuizTimeout);

  onProblemTimeoutRef.current = onProblemTimeout;
  onQuizTimeoutRef.current = onQuizTimeout;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    const now = Date.now();
    quizStartTimeRef.current = now;
    problemStartTimeRef.current = now;

    setState(prev => ({
      ...prev,
      isRunning: true,
      problemStartTimes: [now],
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  const advanceToProblem = useCallback((index: number) => {
    const now = Date.now();
    const duration = (now - problemStartTimeRef.current) / 1000;
    problemStartTimeRef.current = now;

    setState(prev => {
      const newDurations = [...prev.problemDurations];
      if (prev.currentProblemIndex < newDurations.length) {
        newDurations[prev.currentProblemIndex] = duration;
      }

      return {
        ...prev,
        currentProblemIndex: index,
        timeRemaining: config.mode === 'per-problem' ? config.secondsPerProblem : prev.timeRemaining,
        problemStartTimes: [...prev.problemStartTimes, now],
        problemDurations: newDurations,
      };
    });
  }, [config.mode, config.secondsPerProblem]);

  const recordAnswer = useCallback((problemIndex: number) => {
    const now = Date.now();
    const duration = (now - problemStartTimeRef.current) / 1000;

    setState(prev => {
      const newDurations = [...prev.problemDurations];
      newDurations[problemIndex] = duration;
      return { ...prev, problemDurations: newDurations };
    });
  }, []);

  const getResults = useCallback((): TimedQuizResults => {
    const totalTime = (Date.now() - quizStartTimeRef.current) / 1000;
    const answeredDurations = state.problemDurations.filter(d => d > 0);
    const averagePace = answeredDurations.length > 0
      ? answeredDurations.reduce((a, b) => a + b, 0) / answeredDurations.length
      : 0;

    const timedOutProblems = state.problemDurations
      .map((d, i) => d === 0 ? i : -1)
      .filter(i => i !== -1);

    return {
      totalTime,
      timePerProblem: state.problemDurations,
      averagePace,
      timedOutProblems,
    };
  }, [state.problemDurations]);

  const formatTime = useCallback((seconds: number): string => {
    const totalSecs = Math.round(seconds);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (config.mode === 'none' || !state.isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          if (config.mode === 'per-problem') {
            const currentIdx = prev.currentProblemIndex;

            // Record timeout duration for current problem
            const newDurations = [...prev.problemDurations];
            newDurations[currentIdx] = config.secondsPerProblem;

            setTimeout(() => onProblemTimeoutRef.current(currentIdx), 0);

            if (currentIdx >= problemCount - 1) {
              // Last problem - end quiz
              clearTimer();
              setTimeout(() => onQuizTimeoutRef.current(), 0);
              return {
                ...prev,
                timeRemaining: 0,
                isRunning: false,
                problemDurations: newDurations,
              };
            }

            // Auto-advance to next problem with timer reset
            problemStartTimeRef.current = Date.now();
            return {
              ...prev,
              timeRemaining: config.secondsPerProblem,
              currentProblemIndex: currentIdx + 1,
              problemDurations: newDurations,
            };
          } else {
            // Total quiz mode - end quiz
            clearTimer();
            setTimeout(() => onQuizTimeoutRef.current(), 0);
            return { ...prev, timeRemaining: 0, isRunning: false };
          }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return clearTimer;
  }, [config.mode, config.secondsPerProblem, state.isRunning, problemCount, clearTimer]);

  return {
    state,
    startTimer,
    pauseTimer,
    advanceToProblem,
    recordAnswer,
    getResults,
    formatTime,
    isTimerEnabled: config.mode !== 'none',
  };
}
