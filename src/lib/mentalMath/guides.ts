import { mentalMathGuides } from '../../data/mentalMathMoves';
import type { MentalMathGuide } from '../../types/mentalMath';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getMentalMathGuide(grade: number, problemTypeId: string): MentalMathGuide | null {
  const normalizedProblemTypeId = normalizeKey(problemTypeId);

  return (
    mentalMathGuides.find(
      (guide) => guide.grade === grade && normalizeKey(guide.problemTypeId) === normalizedProblemTypeId
    ) ?? null
  );
}

export function getMentalMathGuideForProblem(grade: number, problemType: string): MentalMathGuide | null {
  const normalizedProblemType = normalizeKey(problemType);

  return (
    mentalMathGuides.find((guide) => {
      if (guide.grade !== grade) {
        return false;
      }

      return (
        normalizeKey(guide.problemTypeId) === normalizedProblemType ||
        normalizeKey(guide.problemTypeName) === normalizedProblemType
      );
    }) ?? null
  );
}

export function summarizeMentalMathGuide(guide: MentalMathGuide | null): string {
  if (!guide) {
    return '';
  }

  const moveTitles = guide.coreMoves.slice(0, 2).map((move) => move.title).join(', ');
  const firstMove = guide.coreMoves[0];

  return [
    `${guide.problemTypeName} Mental Math Moves`,
    guide.intro,
    `Look for: ${guide.gamePlan.whatToLookFor}`,
    `First move: ${guide.gamePlan.bestFirstMove}`,
    `Check fast: ${guide.gamePlan.howToCheckFast}`,
    moveTitles ? `Top moves: ${moveTitles}` : null,
    firstMove ? `Starter tip: ${firstMove.kidFriendlyRule}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
