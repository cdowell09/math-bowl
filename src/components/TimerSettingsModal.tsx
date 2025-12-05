import { useState } from 'react';
import { TimerConfig, TimerMode } from '../types/timer';

interface TimerSettingsModalProps {
  config: TimerConfig;
  onSave: (updates: Partial<TimerConfig>) => void;
  onClose: () => void;
}

export function TimerSettingsModal({ config, onSave, onClose }: TimerSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<TimerConfig>(config);

  const handleModeChange = (mode: TimerMode) => {
    setLocalConfig(prev => ({ ...prev, mode }));
  };

  const handleSecondsChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 5 && num <= 120) {
      setLocalConfig(prev => ({ ...prev, secondsPerProblem: num }));
    }
  };

  const handleMinutesChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= 30) {
      setLocalConfig(prev => ({ ...prev, totalMinutes: num }));
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <h2>Timer Settings</h2>

        <div className="timer-mode-section">
          <p className="settings-label">Timer Mode</p>
          <div className="timer-mode-buttons">
            <button
              className={`mode-button ${localConfig.mode === 'none' ? 'active' : ''}`}
              onClick={() => handleModeChange('none')}
            >
              Off
            </button>
            <button
              className={`mode-button ${localConfig.mode === 'per-problem' ? 'active' : ''}`}
              onClick={() => handleModeChange('per-problem')}
            >
              Per Problem
            </button>
            <button
              className={`mode-button ${localConfig.mode === 'total-quiz' ? 'active' : ''}`}
              onClick={() => handleModeChange('total-quiz')}
            >
              Total Quiz
            </button>
          </div>
        </div>

        {localConfig.mode === 'per-problem' && (
          <div className="timer-config-section">
            <label className="settings-label" htmlFor="seconds-input">
              Seconds per problem
            </label>
            <div className="number-input-wrapper">
              <input
                id="seconds-input"
                type="number"
                min="5"
                max="120"
                value={localConfig.secondsPerProblem}
                onChange={e => handleSecondsChange(e.target.value)}
                className="number-input"
              />
              <span className="input-hint">5-120 seconds</span>
            </div>
          </div>
        )}

        {localConfig.mode === 'total-quiz' && (
          <div className="timer-config-section">
            <label className="settings-label" htmlFor="minutes-input">
              Total minutes for quiz
            </label>
            <div className="number-input-wrapper">
              <input
                id="minutes-input"
                type="number"
                min="1"
                max="30"
                value={localConfig.totalMinutes}
                onChange={e => handleMinutesChange(e.target.value)}
                className="number-input"
              />
              <span className="input-hint">1-30 minutes</span>
            </div>
          </div>
        )}

        {localConfig.mode !== 'none' && (
          <p className="timer-info">
            Unanswered problems when time runs out will be marked incorrect.
          </p>
        )}

        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
