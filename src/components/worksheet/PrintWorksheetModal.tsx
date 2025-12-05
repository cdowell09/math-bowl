import { useState } from 'react';
import { Worksheet, WorksheetProblemCount, WorksheetModalContext } from '../../types/worksheet';
import { PROBLEM_COUNT_OPTIONS } from '../../services/worksheetService';
import { WorksheetPreview } from './WorksheetPreview';

interface PrintWorksheetModalProps {
  isOpen: boolean;
  context: WorksheetModalContext | null;
  worksheet: Worksheet | null;
  onClose: () => void;
  onGenerate: (count: WorksheetProblemCount, includeAnswerKey: boolean) => void;
  onPrint: () => void;
  onReset: () => void;
}

export function PrintWorksheetModal({
  isOpen,
  context,
  worksheet,
  onClose,
  onGenerate,
  onPrint,
  onReset,
}: PrintWorksheetModalProps) {
  const [problemCount, setProblemCount] = useState<WorksheetProblemCount>(10);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);

  if (!isOpen || !context) return null;

  const handleGenerate = () => {
    onGenerate(problemCount, includeAnswerKey);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <h2>Print Worksheet</h2>
        <p className="worksheet-subtitle">
          {context.grade.name} - {context.problemType.name}
        </p>

        {!worksheet ? (
          <>
            <div className="timer-mode-section">
              <p className="settings-label">Number of Problems</p>
              <div className="timer-mode-buttons">
                {PROBLEM_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    className={`mode-button ${problemCount === count ? 'active' : ''}`}
                    onClick={() => setProblemCount(count)}
                    type="button"
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="timer-mode-section">
              <label className="worksheet-checkbox-label">
                <input
                  type="checkbox"
                  checked={includeAnswerKey}
                  onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                />
                Include Answer Key
              </label>
            </div>

            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="modal-button save" onClick={handleGenerate} type="button">
                Generate
              </button>
            </div>
          </>
        ) : (
          <>
            <WorksheetPreview worksheet={worksheet} />

            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={onReset} type="button">
                ← Back
              </button>
              <button className="modal-button save" onClick={onPrint} type="button">
                Print
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
