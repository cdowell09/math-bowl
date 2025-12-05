import { Worksheet } from '../../types/worksheet';

interface WorksheetPreviewProps {
  worksheet: Worksheet;
}

export function WorksheetPreview({ worksheet }: WorksheetPreviewProps) {
  const previewCount = Math.min(5, worksheet.problems.length);
  const remaining = worksheet.problems.length - previewCount;

  return (
    <div className="worksheet-preview">
      <div className="worksheet-preview-content">
        <div className="worksheet-preview-header">
          <h3>{worksheet.title}</h3>
          <div className="preview-name-line">Name: ____________________</div>
        </div>

        <div className="worksheet-problems-preview">
          {worksheet.problems.slice(0, previewCount).map((problem, index) => (
            <div key={problem.id} className="preview-problem">
              {index + 1}. {problem.display} ______
            </div>
          ))}
          {remaining > 0 && (
            <div className="preview-ellipsis">... and {remaining} more problems</div>
          )}
        </div>

        {worksheet.includeAnswerKey && (
          <div className="preview-answer-key-indicator">
            Answer key will be included
          </div>
        )}
      </div>
    </div>
  );
}
