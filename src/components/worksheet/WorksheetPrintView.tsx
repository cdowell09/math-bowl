import { Worksheet } from '../../types/worksheet';
import { getMentalMathGuide } from '../../lib/mentalMath/guides';

interface WorksheetPrintViewProps {
  worksheet: Worksheet | null;
}

export function WorksheetPrintView({ worksheet }: WorksheetPrintViewProps) {
  if (!worksheet) return null;

  const guide = getMentalMathGuide(worksheet.grade, worksheet.problemTypeId);

  return (
    <div className="worksheet-print-view">
      <div className="print-page problems-page">
        <header className="print-header">
          <h1 className="print-title">{worksheet.title}</h1>
          <div className="print-name-line">Name: ________________________________</div>
        </header>

        <ol className="print-problems-list">
          {worksheet.problems.map((problem, index) => (
            <li key={problem.id} className="print-problem">
              <span className="print-problem-number">{index + 1}.</span>
              <span className="print-problem-display">{problem.display}</span>
              <span className="print-answer-blank"></span>
            </li>
          ))}
        </ol>

        {guide && (
          <section className="print-strategy-box">
            <h2>Fast ways to think</h2>
            <p>{guide.gamePlan.bestFirstMove}</p>
            <ul>
              {guide.coreMoves.slice(0, 2).map((move) => (
                <li key={move.id}>
                  <strong>{move.title}:</strong> {move.kidFriendlyRule}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {worksheet.includeAnswerKey && (
        <div className="print-page answer-key-page">
          <header className="print-header">
            <h1 className="print-title">{worksheet.title} - Answer Key</h1>
          </header>

          <ol className="print-answers-list">
            {worksheet.problems.map((problem, index) => (
              <li key={problem.id} className="print-answer">
                <span className="print-problem-number">{index + 1}.</span>
                <span className="print-problem-display">{problem.display}</span>
                <span className="print-answer-value">{problem.answer}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
