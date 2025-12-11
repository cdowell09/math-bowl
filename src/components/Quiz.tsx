import { useState, useEffect, useCallback } from 'react';
import { Problem, ProblemType } from '../types';
import { TimerConfig, TimedQuizResults, DEFAULT_TIMER_CONFIG } from '../types/timer';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

interface QuizProps {
  problemType: ProblemType;
  onComplete: (score: number, total: number, problems: Problem[], answers: (number | null)[], timing?: TimedQuizResults) => void;
  onBack: () => void;
  timerConfig?: TimerConfig;
  theme: Theme;
  onToggleTheme: () => void;
}

const QUIZ_SIZE = 10;

const isSurpriseMe = (problemType: ProblemType) => problemType.id === 'surprise-me';

export function Quiz({ problemType, onComplete, onBack, timerConfig, theme, onToggleTheme }: QuizProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<(string)[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = timerConfig ?? DEFAULT_TIMER_CONFIG;

  const handleProblemTimeout = useCallback((_problemIndex: number) => {
    // Timer auto-advances in per-problem mode
    // Unanswered problems remain as empty strings and will be marked wrong on submit
  }, []);

  const handleQuizTimeout = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  const timer = useTimer({
    config,
    problemCount: QUIZ_SIZE,
    onProblemTimeout: handleProblemTimeout,
    onQuizTimeout: handleQuizTimeout,
  });

  useEffect(() => {
    const generated = Array.from({ length: QUIZ_SIZE }, () => problemType.generate());
    setProblems(generated);
    setAnswers(Array(QUIZ_SIZE).fill(''));
    setHasStarted(false);
    setIsSubmitting(false);
  }, [problemType]);

  useEffect(() => {
    if (problems.length > 0 && !hasStarted && timer.isTimerEnabled) {
      setHasStarted(true);
      timer.startTimer();
    }
  }, [problems.length, hasStarted, timer]);

  useEffect(() => {
    if (isSubmitting && problems.length > 0) {
      performSubmit();
    }
  }, [isSubmitting]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    if (timer.isTimerEnabled && value !== '' && answers[index] === '') {
      timer.recordAnswer(index);
    }
  };

  const performSubmit = () => {
    const numericAnswers = answers.map(a => a === '' ? null : parseFloat(a));
    const score = problems.reduce((acc, problem, i) => {
      const userAnswer = numericAnswers[i];
      if (userAnswer === null) return acc;
      const isCorrect = Math.abs(userAnswer - problem.answer) < 0.001;
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    const timing = timer.isTimerEnabled ? timer.getResults() : undefined;
    onComplete(score, QUIZ_SIZE, problems, numericAnswers, timing);
  };

  const handleSubmit = () => {
    if (timer.isTimerEnabled) {
      timer.pauseTimer();
    }
    performSubmit();
  };

  const allAnswered = answers.every(a => a !== '');
  const canSubmit = timer.isTimerEnabled ? true : allAnswered;

  return (
    <div className="quiz">
      <div className="header-bar">
        <div className="header-bar-left">
          <button className="back-button" onClick={onBack}>← Back</button>
        </div>
        <div className="header-bar-center">
          {timer.isTimerEnabled && (
            <TimerDisplay
              timeRemaining={timer.state.timeRemaining}
              mode={config.mode}
              formatTime={timer.formatTime}
            />
          )}
        </div>
        <div className="header-bar-right">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
      <h2>{problemType.name}</h2>
      <p className="quiz-instructions">{problemType.description}</p>

      <div className="problems-list">
        {problems.map((problem, index) => (
          <div key={problem.id} className="problem-row">
            <div className="problem-header">
              <span className="problem-number">{index + 1}.</span>
              {isSurpriseMe(problemType) && (
                <span className="problem-category">{problem.typeName}</span>
              )}
            </div>
            <span className="problem-display">
              {problem.display}
            </span>
            <input
              type="text"
              inputMode="numeric"
              className="answer-input"
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="?"
            />
          </div>
        ))}
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {timer.isTimerEnabled && !allAnswered ? 'Submit Early' : 'Check My Answers!'}
      </button>
    </div>
  );
}
