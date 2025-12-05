import { TimerMode } from '../types/timer';

interface TimerDisplayProps {
  timeRemaining: number;
  mode: TimerMode;
  formatTime: (seconds: number) => string;
}

export function TimerDisplay({ timeRemaining, mode, formatTime }: TimerDisplayProps) {
  if (mode === 'none') return null;

  const isWarning = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div className={`timer-display ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
      <span className="timer-icon">
        {mode === 'per-problem' ? 'Q' : 'T'}
      </span>
      <span className="timer-value">{formatTime(timeRemaining)}</span>
    </div>
  );
}
