import { GradeConfig } from '../types';

interface GradeSelectorProps {
  grades: GradeConfig[];
  onSelect: (grade: GradeConfig) => void;
}

export function GradeSelector({ grades, onSelect }: GradeSelectorProps) {
  return (
    <div className="grade-selector">
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
