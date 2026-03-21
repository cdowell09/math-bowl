import { useMemo } from 'react';
import type { GradeConfig, ProblemType } from '../../types';
import { getMentalMathGuide } from '../../lib/mentalMath/guides';
import type { Theme } from '../../hooks/useTheme';
import { ThemeToggle } from '../ThemeToggle';
import { MentalMathGuideView } from './MentalMathGuideView';

interface MentalMathLibraryProps {
  grade: GradeConfig;
  activeProblemType?: ProblemType | null;
  onBack: () => void;
  onSelectProblemType: (problemType: ProblemType) => void;
  onStartPractice: (problemType: ProblemType) => void;
  theme?: Theme;
  onToggleTheme?: () => void;
}

export function MentalMathLibrary({
  grade,
  activeProblemType: controlledProblemType,
  onBack,
  onSelectProblemType,
  onStartPractice,
  theme,
  onToggleTheme,
}: MentalMathLibraryProps) {
  const activeProblemType = useMemo(
    () => controlledProblemType ?? grade.problemTypes[0] ?? null,
    [controlledProblemType, grade.problemTypes]
  );

  const activeGuide = activeProblemType ? getMentalMathGuide(grade.grade, activeProblemType.id) : null;

  return (
    <div className="mental-math-library">
      <div className="header-bar">
        <div className="header-bar-left">
          <button className="back-button" onClick={onBack}>← Back</button>
        </div>
        <div className="header-bar-center">
          <span className="mental-math-library-badge">Mental Math Moves</span>
        </div>
        <div className="header-bar-right">
          {theme && onToggleTheme ? <ThemeToggle theme={theme} onToggle={onToggleTheme} /> : null}
        </div>
      </div>

      <h1>Winning Tricks for {grade.name}</h1>
      <p>Study the fastest thinking moves for each topic, then jump straight into practice.</p>

      <div className="mental-math-topic-tabs" role="tablist" aria-label={`${grade.name} topics`}>
        {grade.problemTypes.map((problemType) => (
          <button
            key={problemType.id}
            className={`mental-math-topic-tab${problemType.id === activeProblemType?.id ? ' mental-math-topic-tab--active' : ''}`}
            onClick={() => onSelectProblemType(problemType)}
            type="button"
            aria-pressed={problemType.id === activeProblemType?.id}
          >
            {problemType.name}
          </button>
        ))}
      </div>

      {activeGuide ? (
        <>
          <MentalMathGuideView guide={activeGuide} />
          {activeProblemType ? (
            <div className="mental-math-library-actions">
              <button className="submit-button" onClick={() => onStartPractice(activeProblemType)}>
                Start Practicing {activeProblemType.name}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mental-math-empty-state">
          <h2>Guide coming soon</h2>
          <p>This topic does not have a strategy guide yet.</p>
        </div>
      )}
    </div>
  );
}
