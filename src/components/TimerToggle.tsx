import { TimerConfig } from '../types/timer';

interface TimerToggleProps {
  config: TimerConfig;
  onToggle: () => void;
  onOpenSettings: () => void;
}

export function TimerToggle({ config, onToggle, onOpenSettings }: TimerToggleProps) {
  const isEnabled = config.mode !== 'none';

  const getTimerDescription = () => {
    if (config.mode === 'per-problem') {
      return `${config.secondsPerProblem}s per problem`;
    }
    if (config.mode === 'total-quiz') {
      return `${config.totalMinutes} min total`;
    }
    return 'Off';
  };

  return (
    <div className={`timer-toggle ${isEnabled ? 'timer-toggle--active' : ''}`}>
      <div className="timer-toggle-info" onClick={onOpenSettings}>
        <span className="timer-toggle-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </span>
        <span className="timer-toggle-label">
          Timer: <strong>{getTimerDescription()}</strong>
        </span>
        <span className="timer-toggle-edit">Edit</span>
      </div>
      <button
        className={`timer-toggle-switch ${isEnabled ? 'timer-toggle-switch--on' : ''}`}
        onClick={onToggle}
        aria-label={isEnabled ? 'Turn timer off' : 'Turn timer on'}
      >
        <span className="timer-toggle-switch-track">
          <span className="timer-toggle-switch-thumb" />
        </span>
        <span className="timer-toggle-switch-label">{isEnabled ? 'ON' : 'OFF'}</span>
      </button>
    </div>
  );
}
