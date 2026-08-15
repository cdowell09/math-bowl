import { useEffect } from 'react';

interface UsePrintOptions {
  onAfterPrint?: () => void;
}

export function usePrint(options: UsePrintOptions = {}) {
  const { onAfterPrint } = options;

  useEffect(() => {
    if (!onAfterPrint) return;
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, [onAfterPrint]);
}
