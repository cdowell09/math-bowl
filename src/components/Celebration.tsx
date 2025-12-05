import { useEffect, useState } from 'react';

const ANIMALS = ['🐶', '🦄', '🦕', '🐙'];

export function Celebration() {
  const [animal] = useState(() => ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide after animation completes
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="celebration-container">
      <div className="flying-animal">
        <div className="rainbow-trail">
          <span className="rainbow-segment" style={{ background: '#ff0000' }} />
          <span className="rainbow-segment" style={{ background: '#ff8000' }} />
          <span className="rainbow-segment" style={{ background: '#ffff00' }} />
          <span className="rainbow-segment" style={{ background: '#00ff00' }} />
          <span className="rainbow-segment" style={{ background: '#0080ff' }} />
          <span className="rainbow-segment" style={{ background: '#8000ff' }} />
        </div>
        <span className="animal-emoji">{animal}</span>
      </div>
    </div>
  );
}
