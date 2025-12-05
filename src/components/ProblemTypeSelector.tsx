import { GradeConfig, ProblemType } from '../types';
import { TimerConfig } from '../types/timer';
import { WorksheetModalContext } from '../types/worksheet';
import { TimerToggle } from './TimerToggle';

interface ProblemTypeSelectorProps {
  grade: GradeConfig;
  onSelect: (problemType: ProblemType) => void;
  onBack: () => void;
  onPrintWorksheet: (context: WorksheetModalContext) => void;
  timerConfig: TimerConfig;
  onTimerToggle: () => void;
  onOpenTimerSettings: () => void;
}

function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export function ProblemTypeSelector({ grade, onSelect, onBack, onPrintWorksheet, timerConfig, onTimerToggle, onOpenTimerSettings }: ProblemTypeSelectorProps) {
  const handleSurpriseMe = () => {
    const surpriseProblemType: ProblemType = {
      id: 'surprise-me',
      name: 'Surprise Me!',
      description: 'A mix of all problem types',
      generate: () => {
        const randomType = grade.problemTypes[Math.floor(Math.random() * grade.problemTypes.length)];
        return randomType.generate();
      }
    };
    onSelect(surpriseProblemType);
  };

  const handlePrintClick = (e: React.MouseEvent, pt: ProblemType) => {
    e.stopPropagation();
    onPrintWorksheet({
      source: 'problemTypeSelector',
      grade,
      problemType: pt,
    });
  };

  const handleSurpriseMePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    const surpriseProblemType: ProblemType = {
      id: 'surprise-me',
      name: 'Surprise Me!',
      description: 'A mix of all problem types',
      generate: () => {
        const randomType = grade.problemTypes[Math.floor(Math.random() * grade.problemTypes.length)];
        return randomType.generate();
      }
    };
    onPrintWorksheet({
      source: 'problemTypeSelector',
      grade,
      problemType: surpriseProblemType,
    });
  };

  return (
    <div className="problem-type-selector">
      <button className="back-button" onClick={onBack}>← Back</button>
      <h2>{grade.name}</h2>
      <p>Choose what to practice:</p>

      <TimerToggle
        config={timerConfig}
        onToggle={onTimerToggle}
        onOpenSettings={onOpenTimerSettings}
      />

      <button className="surprise-me-button" onClick={handleSurpriseMe}>
        Surprise Me!
        <button
          className="card-print-button"
          onClick={handleSurpriseMePrint}
          type="button"
          aria-label="Print Surprise Me worksheet"
        >
          <PrintIcon />
        </button>
      </button>

      <div className="problem-type-grid">
        {grade.problemTypes.map((pt) => (
          <button
            key={pt.id}
            className="problem-type-card"
            onClick={() => onSelect(pt)}
          >
            <span className="problem-type-name">{pt.name}</span>
            <span className="problem-type-desc">{pt.description}</span>
            <button
              className="card-print-button"
              onClick={(e) => handlePrintClick(e, pt)}
              type="button"
              aria-label={`Print ${pt.name} worksheet`}
            >
              <PrintIcon />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
