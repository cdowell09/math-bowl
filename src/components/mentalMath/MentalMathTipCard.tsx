import type { MentalMathGuide } from '../../types/mentalMath';

interface MentalMathTipCardProps {
  guide: MentalMathGuide;
  heading?: string;
  className?: string;
}

export function MentalMathTipCard({ guide, heading = "Today's Tip", className = '' }: MentalMathTipCardProps) {
  const topMove = guide.coreMoves[0];

  if (!topMove) {
    return null;
  }

  return (
    <section className={`mental-math-tip-card ${className}`.trim()}>
      <p className="mental-math-tip-eyebrow">{heading}</p>
      <div className="mental-math-tip-copy">
        <h3>{topMove.title}</h3>
        <p>{topMove.kidFriendlyRule}</p>
      </div>
      <div className="mental-math-tip-rows">
        <p className="mental-math-tip-row"><strong>Look for:</strong> {guide.gamePlan.whatToLookFor}</p>
        <p className="mental-math-tip-row"><strong>Try first:</strong> {guide.gamePlan.bestFirstMove}</p>
      </div>
    </section>
  );
}
