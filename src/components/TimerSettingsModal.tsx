import { useState } from 'react';
import { TimerConfig, TimerMode } from '../types/timer';

interface TimerSettingsModalProps {
  config: TimerConfig;
  onSave: (updates: Partial<TimerConfig>) => void;
  onClose: () => void;
}

export function TimerSettingsModal({ config, onSave, onClose }: TimerSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<TimerConfig>(config);
  const [secondsInput, setSecondsInput] = useState(() => String(config.secondsPerProblem));
  const [minutesInput, setMinutesInput] = useState(() => String(config.totalMinutes));

  const handleModeChange = (mode: TimerMode) => {
    setLocalConfig(prev => ({ ...prev, mode }));
  };

  const handleSecondsChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setSecondsInput(sanitized);

    const num = parseInt(sanitized, 10);
    if (!isNaN(num) && num >= 5 && num <= 120) {
      setLocalConfig(prev => ({ ...prev, secondsPerProblem: num }));
    }
  };

  const handleMinutesChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '');
    setMinutesInput(sanitized);

    const num = parseInt(sanitized, 10);
    if (!isNaN(num) && num >= 1 && num <= 30) {
      setLocalConfig(prev => ({ ...prev, totalMinutes: num }));
    }
  };

  const commitSecondsInput = () => {
    const num = parseInt(secondsInput, 10);
    const normalized = isNaN(num)
      ? localConfig.secondsPerProblem
      : Math.max(5, Math.min(120, num));

    setSecondsInput(String(normalized));
    setLocalConfig(prev => ({ ...prev, secondsPerProblem: normalized }));
    return normalized;
  };

  const commitMinutesInput = () => {
    const num = parseInt(minutesInput, 10);
    const normalized = isNaN(num)
      ? localConfig.totalMinutes
      : Math.max(1, Math.min(30, num));

    setMinutesInput(String(normalized));
    setLocalConfig(prev => ({ ...prev, totalMinutes: normalized }));
    return normalized;
  };

  const handleSave = () => {
    const normalizedConfig: TimerConfig = {
      ...localConfig,
      secondsPerProblem: commitSecondsInput(),
      totalMinutes: commitMinutesInput(),
    };
    onSave(normalizedConfig);
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
                inputMode="numeric"
                pattern="[0-9]*"
                value={secondsInput}
                onChange={e => handleSecondsChange(e.target.value)}
                onBlur={commitSecondsInput}
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
                inputMode="numeric"
                pattern="[0-9]*"
                value={minutesInput}
                onChange={e => handleMinutesChange(e.target.value)}
                onBlur={commitMinutesInput}
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
