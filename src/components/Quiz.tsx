import { useState, useEffect, useCallback } from 'react';
import { GradeConfig, Problem, ProblemType } from '../types';
import { TimerConfig, TimedQuizResults, DEFAULT_TIMER_CONFIG } from '../types/timer';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { getMentalMathGuide } from '../lib/mentalMath/guides';
import { MentalMathTipCard } from './mentalMath';
import {
  ElapsedTimeAnswerFields,
  ElapsedTimeAnswerMode,
  getElapsedTimeAnswerMinutes,
} from '../lib/elapsedTime';

interface QuizProps {
  grade: GradeConfig;
  problemType: ProblemType;
  onComplete: (score: number, total: number, problems: Problem[], answers: (number | null)[], timing?: TimedQuizResults) => void;
  onBack: () => void;
  timerConfig?: TimerConfig;
  theme: Theme;
  onToggleTheme: () => void;
}

const QUIZ_SIZE = 10;

const isSurpriseMe = (problemType: ProblemType) => problemType.id === 'surprise-me';

function makeElapsedTimeAnswerFields(): ElapsedTimeAnswerFields {
  return {
    hours: '',
    minutes: '',
  };
}

function sanitizeElapsedTimeInput(value: string): string {
  return value.replace(/[^\d]/g, '');
}

function isElapsedTimeAnswered(mode: ElapsedTimeAnswerMode, fields: ElapsedTimeAnswerFields): boolean {
  if (mode === 'minutes') {
    return fields.minutes !== '';
  }

  return fields.hours !== '' || fields.minutes !== '';
}

function convertElapsedTimeAnswers(
  answers: ElapsedTimeAnswerFields[],
  fromMode: ElapsedTimeAnswerMode,
  toMode: ElapsedTimeAnswerMode,
): ElapsedTimeAnswerFields[] {
  if (fromMode === toMode) {
    return answers;
  }

  if (toMode === 'minutes') {
    return answers.map((answer) => {
      const totalMinutes = getElapsedTimeAnswerMinutes(fromMode, answer);

      return {
        hours: '',
        minutes: totalMinutes === null ? '' : totalMinutes.toString(),
      };
    });
  }

  return answers.map((answer) => {
    const totalMinutes = getElapsedTimeAnswerMinutes(fromMode, answer);

    if (totalMinutes === null) {
      return makeElapsedTimeAnswerFields();
    }

    return {
      hours: Math.floor(totalMinutes / 60).toString(),
      minutes: (totalMinutes % 60).toString(),
    };
  });
}

export function Quiz({ grade, problemType, onComplete, onBack, timerConfig, theme, onToggleTheme }: QuizProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<(string)[]>([]);
  const [elapsedTimeAnswerMode, setElapsedTimeAnswerMode] = useState<ElapsedTimeAnswerMode>('minutes');
  const [elapsedTimeAnswers, setElapsedTimeAnswers] = useState<ElapsedTimeAnswerFields[]>(
    Array.from({ length: QUIZ_SIZE }, makeElapsedTimeAnswerFields)
  );
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
    setElapsedTimeAnswerMode('minutes');
    setElapsedTimeAnswers(Array.from({ length: QUIZ_SIZE }, makeElapsedTimeAnswerFields));
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

  const handleElapsedTimeFieldChange = (
    index: number,
    field: keyof ElapsedTimeAnswerFields,
    value: string,
  ) => {
    const sanitizedValue = sanitizeElapsedTimeInput(value);
    const newAnswers = [...elapsedTimeAnswers];
    const previousAnswer = newAnswers[index];
    const nextAnswer = {
      ...previousAnswer,
      [field]: sanitizedValue,
    };

    newAnswers[index] = nextAnswer;
    setElapsedTimeAnswers(newAnswers);

    if (
      timer.isTimerEnabled &&
      !isElapsedTimeAnswered(elapsedTimeAnswerMode, previousAnswer) &&
      isElapsedTimeAnswered(elapsedTimeAnswerMode, nextAnswer)
    ) {
      timer.recordAnswer(index);
    }
  };

  const handleElapsedTimeModeChange = (mode: ElapsedTimeAnswerMode) => {
    if (mode === elapsedTimeAnswerMode) {
      return;
    }

    setElapsedTimeAnswers((currentAnswers) => convertElapsedTimeAnswers(currentAnswers, elapsedTimeAnswerMode, mode));
    setElapsedTimeAnswerMode(mode);
  };

  const performSubmit = () => {
    const numericAnswers = problemType.id === 'elapsedTime'
      ? elapsedTimeAnswers.map((answer) => getElapsedTimeAnswerMinutes(elapsedTimeAnswerMode, answer))
      : answers.map((answer) => (answer === '' ? null : Number.parseFloat(answer)));
    const score = problems.reduce((acc, problem, i) => {
      const userAnswer = numericAnswers[i];
      if (userAnswer === null || Number.isNaN(userAnswer)) return acc;
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

  const allAnswered = problemType.id === 'elapsedTime'
    ? elapsedTimeAnswers.every((answer) => isElapsedTimeAnswered(elapsedTimeAnswerMode, answer))
    : answers.every(a => a !== '');
  const canSubmit = timer.isTimerEnabled ? true : allAnswered;
  const mentalMathGuide = !isSurpriseMe(problemType) ? getMentalMathGuide(grade.grade, problemType.id) : null;

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

      {mentalMathGuide && <MentalMathTipCard guide={mentalMathGuide} className="quiz-mental-math-tip" />}

      {problemType.id === 'elapsedTime' && (
        <div className="elapsed-time-mode" role="group" aria-label="Elapsed time answer format">
          <span className="elapsed-time-mode-label">Answer format</span>
          <div className="elapsed-time-mode-buttons">
            <button
              type="button"
              className={`elapsed-time-mode-button${elapsedTimeAnswerMode === 'minutes' ? ' elapsed-time-mode-button--active' : ''}`}
              onClick={() => handleElapsedTimeModeChange('minutes')}
              aria-pressed={elapsedTimeAnswerMode === 'minutes'}
            >
              Minutes
            </button>
            <button
              type="button"
              className={`elapsed-time-mode-button${elapsedTimeAnswerMode === 'hours-minutes' ? ' elapsed-time-mode-button--active' : ''}`}
              onClick={() => handleElapsedTimeModeChange('hours-minutes')}
              aria-pressed={elapsedTimeAnswerMode === 'hours-minutes'}
            >
              Hours + Minutes
            </button>
          </div>
        </div>
      )}

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
            {problemType.id === 'elapsedTime' ? (
              <div className="elapsed-time-answer">
                {elapsedTimeAnswerMode === 'minutes' ? (
                  <label className="elapsed-time-input-group">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="answer-input"
                      value={elapsedTimeAnswers[index]?.minutes ?? ''}
                      onChange={(e) => handleElapsedTimeFieldChange(index, 'minutes', e.target.value)}
                      placeholder="__"
                      aria-label={`Problem ${index + 1} total minutes`}
                    />
                    <span className="elapsed-time-input-suffix">min</span>
                  </label>
                ) : (
                  <>
                    <label className="elapsed-time-input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="answer-input"
                        value={elapsedTimeAnswers[index]?.hours ?? ''}
                        onChange={(e) => handleElapsedTimeFieldChange(index, 'hours', e.target.value)}
                        placeholder="__"
                        aria-label={`Problem ${index + 1} hours`}
                      />
                      <span className="elapsed-time-input-suffix">hr</span>
                    </label>
                    <label className="elapsed-time-input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="answer-input"
                        value={elapsedTimeAnswers[index]?.minutes ?? ''}
                        onChange={(e) => handleElapsedTimeFieldChange(index, 'minutes', e.target.value)}
                        placeholder="__"
                        aria-label={`Problem ${index + 1} minutes`}
                      />
                      <span className="elapsed-time-input-suffix">min</span>
                    </label>
                  </>
                )}
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                className="answer-input"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="?"
              />
            )}
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
