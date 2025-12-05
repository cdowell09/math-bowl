import { WorksheetProblemCount } from '../../types/worksheet';

interface ProblemCountSelectorProps {
  options: readonly WorksheetProblemCount[];
  selected: WorksheetProblemCount;
  onChange: (count: WorksheetProblemCount) => void;
}

export function ProblemCountSelector({
  options,
  selected,
  onChange,
}: ProblemCountSelectorProps) {
  return (
    <div className="problem-count-selector">
      {options.map((count) => (
        <button
          key={count}
          type="button"
          className={`count-option ${selected === count ? 'count-option--selected' : ''}`}
          onClick={() => onChange(count)}
        >
          {count}
        </button>
      ))}
    </div>
  );
}
