import { useState } from 'react';
import { GradeConfig, ProblemType, Problem } from './types';
import { grade1 } from './data/grades/grade1';
import { grade2 } from './data/grades/grade2';
import { grade3 } from './data/grades/grade3';
import { grade4 } from './data/grades/grade4';
import { grade5 } from './data/grades/grade5';
import { GradeSelector } from './components/GradeSelector';
import { ProblemTypeSelector } from './components/ProblemTypeSelector';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';

// Add more grades here as you implement them
const grades: GradeConfig[] = [grade1, grade2, grade3, grade4, grade5];

type Screen = 'grades' | 'problemTypes' | 'quiz' | 'results';

interface QuizResults {
  score: number;
  total: number;
  problems: Problem[];
  answers: (number | null)[];
}

function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<GradeConfig | null>(null);
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  const handleGradeSelect = (grade: GradeConfig) => {
    setSelectedGrade(grade);
    setScreen('problemTypes');
  };

  const handleProblemTypeSelect = (problemType: ProblemType) => {
    setSelectedProblemType(problemType);
    setScreen('quiz');
  };

  const handleQuizComplete = (score: number, total: number, problems: Problem[], answers: (number | null)[]) => {
    setQuizResults({ score, total, problems, answers });
    setScreen('results');
  };

  const handleTryAgain = () => {
    setScreen('quiz');
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setSelectedProblemType(null);
    setQuizResults(null);
    setScreen('grades');
  };

  const handleBackToProblemTypes = () => {
    setSelectedProblemType(null);
    setQuizResults(null);
    setScreen('problemTypes');
  };

  return (
    <div className="app">
      {screen === 'grades' && (
        <GradeSelector grades={grades} onSelect={handleGradeSelect} />
      )}

      {screen === 'problemTypes' && selectedGrade && (
        <ProblemTypeSelector
          grade={selectedGrade}
          onSelect={handleProblemTypeSelect}
          onBack={handleBackToGrades}
        />
      )}

      {screen === 'quiz' && selectedProblemType && (
        <Quiz
          problemType={selectedProblemType}
          onComplete={handleQuizComplete}
          onBack={handleBackToProblemTypes}
        />
      )}

      {screen === 'results' && quizResults && (
        <Results
          score={quizResults.score}
          total={quizResults.total}
          problems={quizResults.problems}
          answers={quizResults.answers}
          onTryAgain={handleTryAgain}
          onBack={handleBackToProblemTypes}
        />
      )}
    </div>
  );
}

export default App;
