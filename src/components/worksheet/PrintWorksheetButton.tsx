interface PrintWorksheetButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function PrintWorksheetButton({
  onClick,
  variant = 'secondary',
  className = '',
}: PrintWorksheetButtonProps) {
  return (
    <button
      className={`print-worksheet-button print-worksheet-button--${variant} ${className}`}
      onClick={onClick}
      type="button"
    >
      Print Worksheet
    </button>
  );
}
