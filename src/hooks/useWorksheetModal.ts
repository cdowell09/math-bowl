import { useState, useCallback } from 'react';
import { Worksheet, WorksheetModalContext, WorksheetProblemCount } from '../types/worksheet';
import { generateWorksheet, createWorksheetFromProblems } from '../services/worksheetService';

interface WorksheetModalState {
  isOpen: boolean;
  context: WorksheetModalContext | null;
}

export function useWorksheetModal() {
  const [modalState, setModalState] = useState<WorksheetModalState>({
    isOpen: false,
    context: null,
  });
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);

  const openModal = useCallback((context: WorksheetModalContext) => {
    setModalState({ isOpen: true, context });
    setWorksheet(null);
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, context: null });
    setWorksheet(null);
  }, []);

  const generateWorksheetFromOptions = useCallback(
    (problemCount: WorksheetProblemCount, includeAnswerKey: boolean) => {
      const { context } = modalState;
      if (!context) return;

      if (
        context.source === 'results' &&
        context.existingProblems &&
        context.existingProblems.length === problemCount
      ) {
        const ws = createWorksheetFromProblems(
          context.grade,
          context.problemType,
          context.existingProblems,
          includeAnswerKey
        );
        setWorksheet(ws);
      } else {
        const ws = generateWorksheet({
          grade: context.grade,
          problemType: context.problemType,
          problemCount,
          includeAnswerKey,
        });
        setWorksheet(ws);
      }
    },
    [modalState]
  );

  const resetWorksheet = useCallback(() => {
    setWorksheet(null);
  }, []);

  return {
    isOpen: modalState.isOpen,
    context: modalState.context,
    worksheet,
    openModal,
    closeModal,
    generateWorksheet: generateWorksheetFromOptions,
    resetWorksheet,
  };
}
