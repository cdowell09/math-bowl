import { GradeConfig, ProblemType } from '../types';

interface ProblemTypeSelectorProps {
  grade: GradeConfig;
  onSelect: (problemType: ProblemType) => void;
  onBack: () => void;
}

export function ProblemTypeSelector({ grade, onSelect, onBack }: ProblemTypeSelectorProps) {
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

  return (
    <div className="problem-type-selector">
      <button className="back-button" onClick={onBack}>← Back</button>
      <h2>{grade.name}</h2>
      <p>Choose what to practice:</p>

      <button className="surprise-me-button" onClick={handleSurpriseMe}>
        Surprise Me!
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
          </button>
        ))}
      </div>
    </div>
  );
}
