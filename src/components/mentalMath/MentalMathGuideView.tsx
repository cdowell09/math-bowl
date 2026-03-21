import type { MentalMathGuide } from '../../types/mentalMath';

interface MentalMathGuideViewProps {
  guide: MentalMathGuide;
}

function ChevronDownIcon() {
  return (
    <svg
      className="mental-math-chevron-icon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MentalMathGuideView({ guide }: MentalMathGuideViewProps) {
  return (
    <div className="mental-math-guide-view">
      <h2>{guide.title}</h2>
      <p>{guide.intro}</p>

      <section className="mental-math-section">
        <h3>Game Plan</h3>
        <ul className="mental-math-list">
          <li><strong>Look for:</strong> {guide.gamePlan.whatToLookFor}</li>
          <li><strong>Best first move:</strong> {guide.gamePlan.bestFirstMove}</li>
          <li><strong>Check fast:</strong> {guide.gamePlan.howToCheckFast}</li>
        </ul>
      </section>

      <section className="mental-math-section mental-math-section--core-moves">
        <h3>Core Moves</h3>
        <div className="mental-math-moves">
          {guide.coreMoves.map((move) => (
            <details key={move.id} className="mental-math-move-card">
              <summary className="mental-math-move-summary">
                <span className="mental-math-move-heading">
                  <span className="mental-math-move-title">{move.title}</span>
                  <span className="mental-math-move-rule">{move.kidFriendlyRule}</span>
                </span>
                <ChevronDownIcon />
              </summary>
              <div className="mental-math-move-content">
                <p><strong>When to use it:</strong> {move.whenToUse}</p>
                <ol className="mental-math-steps">
                  {move.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p><strong>Example:</strong> {move.workedExample}</p>
                <p><strong>Speed tip:</strong> {move.speedTip}</p>
                <p><strong>Watch out:</strong> {move.mistakeToAvoid}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mental-math-grid">
        <div className="mental-math-section">
          <h3>Warm-Up Checklist</h3>
          <ul className="mental-math-list">
            {guide.warmupChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mental-math-section">
          <h3>Common Traps</h3>
          <ul className="mental-math-list">
            {guide.commonTraps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
