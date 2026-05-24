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
      <div className="settings-modal settings-modal--scrollable print-worksheet-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-modal-scroll">
          <h2>Print Worksheet</h2>
          <p className="worksheet-subtitle">
            {context.grade.name} - {context.problemType.name}
          </p>

          {!worksheet ? (
            <>
              <div className="timer-mode-section">
                <p className="settings-label">Problems to print</p>
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
            </>
          ) : (
            <WorksheetPreview worksheet={worksheet} />
          )}
        </div>

        {!worksheet ? (
          <div className="modal-buttons">
            <button className="modal-button cancel" onClick={onClose} type="button">
              Close
            </button>
            <button className="modal-button save" onClick={handleGenerate} type="button">
              Preview worksheet
            </button>
          </div>
        ) : (
          <div className="modal-buttons">
            <button className="modal-button cancel" onClick={onReset} type="button">
              ← Back
            </button>
            <button className="modal-button save" onClick={onPrint} type="button">
              Print worksheet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
