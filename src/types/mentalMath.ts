export interface MentalMathMove {
  id: string;
  title: string;
  kidFriendlyRule: string;
  whenToUse: string;
  steps: string[];
  workedExample: string;
  speedTip: string;
  mistakeToAvoid: string;
}

export interface MentalMathGamePlan {
  whatToLookFor: string;
  bestFirstMove: string;
  howToCheckFast: string;
}

export interface MentalMathGuide {
  grade: number;
  problemTypeId: string;
  problemTypeName: string;
  title: string;
  intro: string;
  coreMoves: MentalMathMove[];
  warmupChecklist: string[];
  commonTraps: string[];
  gamePlan: MentalMathGamePlan;
}
