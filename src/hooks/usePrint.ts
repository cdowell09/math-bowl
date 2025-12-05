import { useCallback, useEffect } from 'react';
import { triggerPrint, preparePrintMode, exitPrintMode } from '../services/printService';

interface UsePrintOptions {
  onAfterPrint?: () => void;
}

export function usePrint(options: UsePrintOptions = {}) {
  const { onAfterPrint } = options;

  useEffect(() => {
    const handleBeforePrint = () => {
      preparePrintMode();
    };

    const handleAfterPrint = () => {
      exitPrintMode();
      onAfterPrint?.();
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onAfterPrint]);

  const print = useCallback(() => {
    triggerPrint();
  }, []);

  return { print };
}
