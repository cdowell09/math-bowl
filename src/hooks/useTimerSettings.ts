import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerConfig, TimerMode, DEFAULT_TIMER_CONFIG } from '../types/timer';

const STORAGE_KEY = 'mathbowl-timer-settings';
const LAST_MODE_KEY = 'mathbowl-timer-last-mode';

export function useTimerSettings() {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);
  const lastModeRef = useRef<TimerMode>('per-problem');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_TIMER_CONFIG, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }

    const savedLastMode = localStorage.getItem(LAST_MODE_KEY);
    if (savedLastMode && (savedLastMode === 'per-problem' || savedLastMode === 'total-quiz')) {
      lastModeRef.current = savedLastMode;
    }
  }, []);

  const updateConfig = useCallback((updates: Partial<TimerConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));

      // Track last active mode
      if (newConfig.mode !== 'none') {
        lastModeRef.current = newConfig.mode;
        localStorage.setItem(LAST_MODE_KEY, newConfig.mode);
      }

      return newConfig;
    });
  }, []);

  const toggleTimer = useCallback(() => {
    setConfig(prev => {
      let newConfig: TimerConfig;

      if (prev.mode !== 'none') {
        // Turn off - save current mode for later
        lastModeRef.current = prev.mode;
        localStorage.setItem(LAST_MODE_KEY, prev.mode);
        newConfig = { ...prev, mode: 'none' };
      } else {
        // Turn on - restore last used mode
        newConfig = { ...prev, mode: lastModeRef.current };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_TIMER_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { config, updateConfig, toggleTimer, resetConfig };
}
