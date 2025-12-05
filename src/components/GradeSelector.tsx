import { GradeConfig } from '../types';
import { TimerConfig } from '../types/timer';
import { TimerToggle } from './TimerToggle';

interface GradeSelectorProps {
  grades: GradeConfig[];
  onSelect: (grade: GradeConfig) => void;
  timerConfig: TimerConfig;
  onTimerToggle: () => void;
  onOpenTimerSettings: () => void;
}

export function GradeSelector({ grades, onSelect, timerConfig, onTimerToggle, onOpenTimerSettings }: GradeSelectorProps) {
  return (
    <div className="grade-selector">
      <h1>Math Bowl Practice</h1>
      <p>Choose your grade:</p>

      <TimerToggle
        config={timerConfig}
        onToggle={onTimerToggle}
        onOpenSettings={onOpenTimerSettings}
      />

      <div className="grade-grid">
        {grades.map((grade) => (
          <button
            key={grade.grade}
            className="grade-card"
            onClick={() => onSelect(grade)}
          >
            Grade {grade.grade}
          </button>
        ))}
      </div>
    </div>
  );
}
