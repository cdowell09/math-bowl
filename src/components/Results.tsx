import { GradeConfig, Problem, ProblemType } from '../types';
import { TimedQuizResults } from '../types/timer';
import { WorksheetModalContext } from '../types/worksheet';
import { Celebration } from './Celebration';
import { TimedResults } from './TimedResults';
import { PrintWorksheetButton } from './worksheet';

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
}

export function Results({ score, total, problems, answers, onTryAgain, onBack, timing, onPrintWorksheet, grade, problemType }: ResultsProps) {
  const percentage = Math.round((score / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect score! Amazing!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 60) return "Good work! Keep practicing!";
    return "Nice try! Practice makes perfect!";
  };

  return (
    <div className="results">
      {percentage === 100 && <Celebration />}
      <h2>{getMessage()}</h2>
      <div className="score-display">
        <span className="score-number">{score}</span>
        <span className="score-divider">/</span>
        <span className="score-total">{total}</span>
      </div>
      <p className="score-percent">{percentage}%</p>

      <div className="results-list">
        {problems.map((problem, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer !== null && Math.abs(userAnswer - problem.answer) < 0.001;
          return (
            <div key={problem.id} className={`result-row ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-main">
                <span className="result-icon">{isCorrect ? '✓' : '✗'}</span>
                <span className="result-problem">{problem.display}</span>
              </div>
              <span className="result-answer">
                {isCorrect ? (
                  <strong>{problem.answer}</strong>
                ) : (
                  <>
                    <span className="wrong-answer">{answers[index] ?? '—'}</span>
                    {' → '}
                    <strong>{problem.answer}</strong>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {timing && <TimedResults timing={timing} problemCount={total} />}

      <div className="results-buttons">
        <button className="try-again-button" onClick={onTryAgain}>
          Try Again
        </button>
        <PrintWorksheetButton
          onClick={() =>
            onPrintWorksheet({
              source: 'results',
              grade,
              problemType,
              existingProblems: problems,
            })
          }
        />
        <button className="back-button" onClick={onBack}>
          Choose Different Problems
        </button>
      </div>
    </div>
  );
}
