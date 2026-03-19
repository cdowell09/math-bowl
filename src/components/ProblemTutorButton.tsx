interface ProblemTutorButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export function ProblemTutorButton({ onClick, isActive = false }: ProblemTutorButtonProps) {
  return (
    <button
      type="button"
      className={`problem-tutor-button${isActive ? ' problem-tutor-button--active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      Help me with this one
    </button>
  );
}
