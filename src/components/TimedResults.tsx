import { TimedQuizResults } from '../types/timer';

interface TimedResultsProps {
  timing: TimedQuizResults;
  problemCount: number;
}

export function TimedResults({ timing, problemCount }: TimedResultsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatPace = (seconds: number): string => {
    return `${seconds.toFixed(1)}s`;
  };

  const answeredCount = problemCount - timing.timedOutProblems.length;

  return (
    <div className="timed-results">
      <h3>Time Stats</h3>
      <div className="timing-stats">
        <div className="stat-item">
          <span className="stat-label">Total Time</span>
          <span className="stat-value">{formatTime(timing.totalTime)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average Pace</span>
          <span className="stat-value">
            {answeredCount > 0 ? formatPace(timing.averagePace) : '—'} / problem
          </span>
        </div>
        {timing.timedOutProblems.length > 0 && (
          <div className="stat-item timeout-stat">
            <span className="stat-label">Timed Out</span>
            <span className="stat-value">{timing.timedOutProblems.length} problems</span>
          </div>
        )}
      </div>
    </div>
  );
}
