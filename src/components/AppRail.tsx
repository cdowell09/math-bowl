type RailSection = 'practice' | 'results' | 'worksheets';

interface AppRailProps {
  active: RailSection;
  resultsAvailable: boolean;
  onPractice: () => void;
  onResults: () => void;
  onWorksheets: () => void;
}

function TrophyMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ResultsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" />
      <rect x="13" y="7" width="3" height="10" />
    </svg>
  );
}

function WorksheetsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

export function AppRail({ active, resultsAvailable, onPractice, onResults, onWorksheets }: AppRailProps) {
  return (
    <aside className="app-rail" aria-label="Primary">
      <div className="app-rail-brand">
        <span className="app-rail-mark" aria-hidden="true">
          <TrophyMark />
        </span>
        <span className="app-rail-wordmark">
          <span className="app-rail-wordmark-lead">Mental</span>
          <span>Math Bowl</span>
        </span>
      </div>

      <nav className="app-rail-nav">
        <button
          type="button"
          className={`app-rail-link${active === 'practice' ? ' app-rail-link--active' : ''}`}
          aria-current={active === 'practice' ? 'page' : undefined}
          onClick={onPractice}
        >
          <PracticeIcon />
          <span>Practice</span>
        </button>
        <button
          type="button"
          className={`app-rail-link${active === 'results' ? ' app-rail-link--active' : ''}`}
          aria-current={active === 'results' ? 'page' : undefined}
          onClick={onResults}
          disabled={!resultsAvailable}
          title={resultsAvailable ? undefined : 'Finish a round to see results'}
        >
          <ResultsIcon />
          <span>Results</span>
        </button>
        <button
          type="button"
          className={`app-rail-link${active === 'worksheets' ? ' app-rail-link--active' : ''}`}
          onClick={onWorksheets}
        >
          <WorksheetsIcon />
          <span>Worksheets</span>
        </button>
      </nav>

      <p className="app-rail-foot">Practice. Focus. Be&nbsp;ready.</p>
    </aside>
  );
}
