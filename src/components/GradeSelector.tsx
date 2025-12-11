import { GradeConfig } from '../types';
import { TimerConfig } from '../types/timer';
import { TimerToggle } from './TimerToggle';
import { Theme } from '../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

interface GradeSelectorProps {
  grades: GradeConfig[];
  onSelect: (grade: GradeConfig) => void;
  timerConfig: TimerConfig;
  onTimerToggle: () => void;
  onOpenTimerSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function GradeSelector({ grades, onSelect, timerConfig, onTimerToggle, onOpenTimerSettings, theme, onToggleTheme }: GradeSelectorProps) {
  return (
    <div className="grade-selector">
      <div className="header-bar">
        <div className="header-bar-left" />
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

      <h1>Math Bowl Practice</h1>
      <p>Choose your grade:</p>

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
