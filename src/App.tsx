import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GradeConfig, ProblemType, Problem } from './types';
import { TimedQuizResults } from './types/timer';
import { WorksheetModalContext } from './types/worksheet';
import { grade1 } from './data/grades/grade1';
import { grade2 } from './data/grades/grade2';
import { grade3 } from './data/grades/grade3';
import { grade4 } from './data/grades/grade4';
import { grade5 } from './data/grades/grade5';
import { GradeSelector } from './components/GradeSelector';
import { ProblemTypeSelector } from './components/ProblemTypeSelector';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { TimerSettingsModal } from './components/TimerSettingsModal';
import { PrintWorksheetModal, WorksheetPrintView } from './components/worksheet';
import { useTimerSettings } from './hooks/useTimerSettings';
import { useWorksheetModal } from './hooks/useWorksheetModal';
import { usePrint } from './hooks/usePrint';

// Add more grades here as you implement them
const grades: GradeConfig[] = [grade1, grade2, grade3, grade4, grade5];

type Screen = 'grades' | 'problemTypes' | 'quiz' | 'results';

interface QuizResults {
  score: number;
  total: number;
  problems: Problem[];
  answers: (number | null)[];
  timing?: TimedQuizResults;
}

function App() {
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<GradeConfig | null>(null);
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const { config: timerConfig, updateConfig: updateTimerConfig, toggleTimer } = useTimerSettings();

  const {
    isOpen: isWorksheetModalOpen,
    context: worksheetContext,
    worksheet,
    openModal: openWorksheetModal,
    closeModal: closeWorksheetModal,
    generateWorksheet,
    resetWorksheet,
  } = useWorksheetModal();

  const { print } = usePrint({
    onAfterPrint: closeWorksheetModal,
  });

  const handleOpenWorksheetModal = (context: WorksheetModalContext) => {
    openWorksheetModal(context);
  };

  const handleGradeSelect = (grade: GradeConfig) => {
    setSelectedGrade(grade);
    setScreen('problemTypes');
  };

  const handleProblemTypeSelect = (problemType: ProblemType) => {
    setSelectedProblemType(problemType);
    setScreen('quiz');
  };

  const handleQuizComplete = (score: number, total: number, problems: Problem[], answers: (number | null)[], timing?: TimedQuizResults) => {
    setQuizResults({ score, total, problems, answers, timing });
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
  <>
    <div className="app">
      {screen === 'grades' && (
        <GradeSelector
          grades={grades}
          onSelect={handleGradeSelect}
          timerConfig={timerConfig}
          onTimerToggle={toggleTimer}
          onOpenTimerSettings={() => setShowTimerSettings(true)}
        />
      )}

      {screen === 'problemTypes' && selectedGrade && (
        <ProblemTypeSelector
          grade={selectedGrade}
          onSelect={handleProblemTypeSelect}
          onBack={handleBackToGrades}
          onPrintWorksheet={handleOpenWorksheetModal}
          timerConfig={timerConfig}
          onTimerToggle={toggleTimer}
          onOpenTimerSettings={() => setShowTimerSettings(true)}
        />
      )}

      {screen === 'quiz' && selectedProblemType && (
        <Quiz
          problemType={selectedProblemType}
          onComplete={handleQuizComplete}
          onBack={handleBackToProblemTypes}
          timerConfig={timerConfig}
        />
      )}

      {screen === 'results' && quizResults && selectedGrade && selectedProblemType && (
        <Results
          score={quizResults.score}
          total={quizResults.total}
          problems={quizResults.problems}
          answers={quizResults.answers}
          onTryAgain={handleTryAgain}
          onBack={handleBackToProblemTypes}
          timing={quizResults.timing}
          onPrintWorksheet={handleOpenWorksheetModal}
          grade={selectedGrade}
          problemType={selectedProblemType}
        />
      )}

      {showTimerSettings && (
        <TimerSettingsModal
          config={timerConfig}
          onSave={updateTimerConfig}
          onClose={() => setShowTimerSettings(false)}
        />
      )}

      <PrintWorksheetModal
        isOpen={isWorksheetModalOpen}
        context={worksheetContext}
        worksheet={worksheet}
        onClose={closeWorksheetModal}
        onGenerate={generateWorksheet}
        onPrint={print}
        onReset={resetWorksheet}
      />
    </div>

    <WorksheetPrintView worksheet={worksheet} />
    <Analytics />
  </>
  );
}

export default App;
