import { GradeConfig, Problem, ProblemType } from '../types';
import { TimerConfig, TimedQuizResults } from '../types/timer';
import { WorksheetModalContext } from '../types/worksheet';
import { useState } from 'react';
import { Celebration } from './Celebration';
import { TimedResults } from './TimedResults';
import { TimerToggle } from './TimerToggle';
import { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';
import { useProblemTutor } from '../hooks/useProblemTutor';
import { useTutorTts } from '../hooks/useTutorTts';
import { TutorPanel } from './TutorPanel';
import { isResultsTutorEnabled, isTutorTtsEnabled } from '../lib/tutor/featureFlags';
import { getMentalMathGuideForProblem } from '../lib/mentalMath/guides';
import { formatElapsedTimeAnswer } from '../lib/elapsedTime';

interface ResultsProps {
  score: number;
  total: number;
  problems: Problem[];
  answers: (number | null)[];
  onTryAgain: () => void;
  onBack: () => void;
  timing?: TimedQuizResults;
  onPrintWorksheet: (context: WorksheetModalContext) => void;
  grade: GradeConfig;
  problemType: ProblemType;
  timerConfig: TimerConfig;
  onTimerToggle: () => void;
  onOpenTimerSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  tts?: TutorTtsControls;
}

type TutorTtsStatus = 'idle' | 'loading' | 'speaking';

interface TutorTtsControls {
  canPlayLatestAssistantMessage: boolean;
  ttsStatus: TutorTtsStatus;
  ttsStatusMessage?: string | null;
  onPlayLatestAssistantMessage: () => void | Promise<void>;
  onStopPlayback: () => void;
}

export function Results({ score, total, problems, answers, onTryAgain, onBack, timing, onPrintWorksheet, grade, problemType, timerConfig, onTimerToggle, onOpenTimerSettings, theme, onToggleTheme, tts }: ResultsProps) {
  const tutor = useProblemTutor();
  const [activeTutorProblemId, setActiveTutorProblemId] = useState<string | null>(null);
  const tutorEnabled = isResultsTutorEnabled();
  const tutorTtsEnabled = isTutorTtsEnabled();
  const internalTts = useTutorTts({
    enabled: tutorTtsEnabled && tutor.isOpen,
    sessionKey: activeTutorProblemId ?? undefined,
    messages: tutor.messages,
  });
  const resolvedTts: TutorTtsControls | undefined = tts ?? (tutorTtsEnabled
    ? {
        canPlayLatestAssistantMessage: internalTts.canPlayLatestAssistantMessage,
        ttsStatus:
          internalTts.status === 'loading' || internalTts.status === 'speaking'
            ? internalTts.status
            : 'idle',
        ttsStatusMessage:
          internalTts.error ??
          (internalTts.isUsingFallbackVoice
            ? internalTts.isKokoroReady
              ? 'Using device voice for this reply.'
              : 'Torch voice is warming up. Using your device voice for now.'
            : internalTts.statusMessage),
        onPlayLatestAssistantMessage: internalTts.playLatestAssistantMessage,
        onStopPlayback: internalTts.stopPlayback,
      }
    : undefined);
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score! Amazing!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 60) return "Good work! Keep practicing!";
    return "Nice try! Practice makes perfect!";
  };

  const formatAnswer = (problem: Problem) => (
    problem.type === 'elapsedTime'
      ? formatElapsedTimeAnswer(problem.answer)
      : problem.answer.toString()
  );

  return (
    <div className="results">
      <div className="header-bar">
        <div className="header-bar-left">
          <button className="back-button" onClick={onBack}>← Back</button>
        </div>
        <div className="header-bar-center">
          <TimerToggle
            config={timerConfig}
            onToggle={onTimerToggle}
            onOpenSettings={onOpenTimerSettings}
          />
        </div>
        <div className="header-bar-right">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {percentage === 100 && <Celebration />}
      <h2>{getMessage()}</h2>
      <div className="score-display">
        <span className="score-number">{score}</span>
        <span className="score-divider">/</span>
        <span className="score-total">{total}</span>
      </div>
      <p className="score-percent">{percentage}%</p>

      <div className={`results-shell${tutorEnabled && tutor.isOpen ? ' results-shell--with-tutor' : ''}`}>
        <div className="results-main">
          <div className="results-list">
            {problems.map((problem, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer !== null && Math.abs(userAnswer - problem.answer) < 0.001;
              const isActiveProblem = activeTutorProblemId === problem.id;
              const guide = !isCorrect
                ? getMentalMathGuideForProblem(grade.grade, problem.typeName || problem.type) ??
                  getMentalMathGuideForProblem(grade.grade, problem.type)
                : null;
              const topMove = guide?.coreMoves[0] ?? null;

              return (
                <div key={problem.id} className={`result-row ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-summary">
                    <div className="result-main">
                      <span className="result-icon">{isCorrect ? '✓' : '✗'}</span>
                      <span className="result-problem">{problem.display}</span>
                    </div>
                    <div className="result-answer">
                      {isCorrect ? (
                        <strong>{formatAnswer(problem)}</strong>
                      ) : (
                        <>
                          <span className="wrong-answer">{answers[index] ?? '—'}</span>
                          {' → '}
                          <strong>{formatAnswer(problem)}</strong>
                        </>
                      )}
                    </div>
                  </div>
                  {!isCorrect && (topMove || tutorEnabled) && (
                    <div className="result-followup">
                      {topMove && (
                        <div className="result-mental-math-tip">
                          <span className="result-mental-math-label">Mental Math Move</span>
                          <strong>{topMove.title}</strong>
                          <span>{topMove.kidFriendlyRule}</span>
                        </div>
                      )}

                      {tutorEnabled && (
                        <div className="result-followup-actions">
                          <span className="result-followup-prompt">Want a walkthrough?</span>
                          <button
                            type="button"
                            className={`problem-tutor-button${isActiveProblem ? ' problem-tutor-button--active' : ''}`}
                            onClick={() => {
                              resolvedTts?.onStopPlayback();
                              setActiveTutorProblemId(problem.id);
                              void tutor.openTutor({
                                grade: grade.grade,
                                problemType: problem.typeName || problemType.name,
                                problemDisplay: problem.display,
                                correctAnswer: problem.answer,
                                studentAnswer: userAnswer,
                              });
                            }}
                            aria-pressed={isActiveProblem}
                          >
                            Get help from Torch
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {timing && <TimedResults timing={timing} problemCount={total} />}

          <div className="results-buttons">
            <button className="try-again-button" onClick={onTryAgain}>
              Try Again
            </button>
            <button
              className="print-worksheet-button"
              onClick={() =>
                onPrintWorksheet({
                  source: 'results',
                  grade,
                  problemType,
                  existingProblems: problems,
                })
              }
              type="button"
            >
              Print Worksheet
            </button>
          </div>
        </div>

        {tutorEnabled && (
          <TutorPanel
            isOpen={tutor.isOpen}
            activeProblem={tutor.activeProblem}
            response={tutor.response}
            isLoading={tutor.isLoading}
            error={tutor.error}
            tts={resolvedTts}
            onSendMessage={tutor.sendMessage}
            onClose={() => {
              resolvedTts?.onStopPlayback();
              setActiveTutorProblemId(null);
              tutor.closeTutor();
            }}
            onReset={() => {
              resolvedTts?.onStopPlayback();
              if (!tutor.activeProblem) {
                setActiveTutorProblemId(null);
                tutor.closeTutor();
                return;
              }

              void tutor.resetTutor();
            }}
          />
        )}
      </div>
    </div>
  );
}
