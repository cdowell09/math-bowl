import { useEffect, useMemo, useState } from 'react';
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
import { MentalMathLibrary } from './components/mentalMath';
import { PrintWorksheetModal, WorksheetPrintView } from './components/worksheet';
import { useTimerSettings } from './hooks/useTimerSettings';
import { useWorksheetModal } from './hooks/useWorksheetModal';
import { usePrint } from './hooks/usePrint';
import { useTheme } from './hooks/useTheme';

// Add more grades here as you implement them
const grades: GradeConfig[] = [grade1, grade2, grade3, grade4, grade5];

type Screen = 'grades' | 'problemTypes' | 'mentalMathLibrary' | 'quiz' | 'results';

interface QuizResults {
  score: number;
  total: number;
  problems: Problem[];
  answers: (number | null)[];
  timing?: TimedQuizResults;
}

function getBasePath(): string {
  if (typeof document === 'undefined') return '';
  const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
  return baseHref.replace(/\/+$/, '');
}

function normalizeRoutePath(pathname: string): string {
  const base = getBasePath();
  const withoutBase = base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
  const clean = withoutBase.replace(/\/+$/, '');
  return clean || '/';
}

function slugifyRouteSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getMentalMathTopicSlug(problemType: ProblemType): string {
  return slugifyRouteSegment(problemType.name);
}

function parseMentalMathPath(pathname: string): { gradeNum: number; topicSlug: string | null } | null {
  const clean = normalizeRoutePath(pathname);
  const match = clean.match(/^\/grade-?(\d+)\/tricks(?:\/([^/]+))?$/i);
  if (!match) return null;

  const gradeNum = parseInt(match[1], 10);
  if (!Number.isFinite(gradeNum)) return null;

  return {
    gradeNum,
    topicSlug: match[2] ? decodeURIComponent(match[2]).toLowerCase() : null,
  };
}

function parseGradeFromPath(pathname: string): number | null {
  const clean = normalizeRoutePath(pathname);
  const match = clean.match(/^\/grade-?(\d+)$/i);
  if (!match) return null;
  const gradeNum = parseInt(match[1], 10);
  return Number.isFinite(gradeNum) ? gradeNum : null;
}

function findMentalMathProblemType(grade: GradeConfig, topicSlug: string | null): ProblemType | null {
  if (!topicSlug) {
    return grade.problemTypes[0] ?? null;
  }

  return (
    grade.problemTypes.find(
      (problemType) =>
        getMentalMathTopicSlug(problemType) === topicSlug ||
        slugifyRouteSegment(problemType.id) === topicSlug
    ) ?? grade.problemTypes[0] ?? null
  );
}

function buildMentalMathPath(grade: GradeConfig, problemType: ProblemType | null): string {
  if (!problemType) {
    return `/grade${grade.grade}/tricks`;
  }

  return `/grade${grade.grade}/tricks/${getMentalMathTopicSlug(problemType)}`;
}

function withBase(path: string): string {
  const base = getBasePath();
  return `${base}${path}` || '/';
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [screen, setScreen] = useState<Screen>('grades');
  const [selectedGrade, setSelectedGrade] = useState<GradeConfig | null>(null);
  const [selectedProblemType, setSelectedProblemType] = useState<ProblemType | null>(null);
  const [selectedMentalMathProblemType, setSelectedMentalMathProblemType] = useState<ProblemType | null>(null);
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

  const gradeByNumber = useMemo(() => {
    const map = new Map<number, GradeConfig>();
    for (const g of grades) map.set(g.grade, g);
    return map;
  }, []);

  const applyPathToState = (pathname: string, replaceHistory = false) => {
    const mentalMathRoute = parseMentalMathPath(pathname);
    if (mentalMathRoute) {
      const grade = gradeByNumber.get(mentalMathRoute.gradeNum) ?? null;

      if (!grade) {
        setSelectedGrade(null);
        setSelectedProblemType(null);
        setSelectedMentalMathProblemType(null);
        setQuizResults(null);
        setScreen('grades');
        if (replaceHistory) {
          window.history.replaceState(null, '', withBase('/'));
        }
        return;
      }

      const problemType = findMentalMathProblemType(grade, mentalMathRoute.topicSlug);

      setSelectedGrade(grade);
      setSelectedProblemType(null);
      setSelectedMentalMathProblemType(problemType);
      setQuizResults(null);
      setScreen('mentalMathLibrary');
      if (replaceHistory) {
        window.history.replaceState(null, '', withBase(buildMentalMathPath(grade, problemType)));
      }
      return;
    }

    const gradeNum = parseGradeFromPath(pathname);
    const grade = gradeNum ? gradeByNumber.get(gradeNum) ?? null : null;

    if (grade) {
      setSelectedGrade(grade);
      setSelectedProblemType(null);
      setSelectedMentalMathProblemType(null);
      setQuizResults(null);
      setScreen('problemTypes');
      if (replaceHistory) {
        window.history.replaceState(null, '', withBase(`/grade${grade.grade}`));
      }
      return;
    }

    setSelectedGrade(null);
    setSelectedProblemType(null);
    setSelectedMentalMathProblemType(null);
    setQuizResults(null);
    setScreen('grades');
    if (replaceHistory) {
      window.history.replaceState(null, '', withBase('/'));
    }
  };

  const pushPath = (path: string) => {
    const next = withBase(path);
    if (window.location.pathname !== next) {
      window.history.pushState(null, '', next);
    }
  };

  useEffect(() => {
    applyPathToState(window.location.pathname, true);
    const onPopState = () => applyPathToState(window.location.pathname, false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleOpenWorksheetModal = (context: WorksheetModalContext) => {
    openWorksheetModal(context);
  };

  const handleGradeSelect = (grade: GradeConfig) => {
    pushPath(`/grade${grade.grade}`);
    setSelectedGrade(grade);
    setSelectedMentalMathProblemType(null);
    setScreen('problemTypes');
  };

  const handleProblemTypeSelect = (problemType: ProblemType) => {
    setSelectedProblemType(problemType);
    setSelectedMentalMathProblemType(problemType);
    setScreen('quiz');
  };

  const handleOpenMentalMathLibrary = () => {
    if (!selectedGrade) return;
    const problemType = selectedMentalMathProblemType ?? selectedGrade.problemTypes[0] ?? null;
    pushPath(buildMentalMathPath(selectedGrade, problemType));
    setSelectedMentalMathProblemType(problemType);
    setScreen('mentalMathLibrary');
  };

  const handleMentalMathProblemTypeSelect = (problemType: ProblemType) => {
    if (!selectedGrade) return;
    pushPath(buildMentalMathPath(selectedGrade, problemType));
    setSelectedMentalMathProblemType(problemType);
  };

  const handleQuizComplete = (score: number, total: number, problems: Problem[], answers: (number | null)[], timing?: TimedQuizResults) => {
    setQuizResults({ score, total, problems, answers, timing });
    setScreen('results');
  };

  const handleTryAgain = () => {
    setScreen('quiz');
  };

  const handleBackToGrades = () => {
    pushPath('/');
    setSelectedGrade(null);
    setSelectedProblemType(null);
    setSelectedMentalMathProblemType(null);
    setQuizResults(null);
    setScreen('grades');
  };

  const handleBackToProblemTypes = () => {
    if (selectedGrade) {
      pushPath(`/grade${selectedGrade.grade}`);
    }
    setSelectedProblemType(null);
    setQuizResults(null);
    setScreen('problemTypes');
  };

  const handleStartPracticeFromLibrary = (problemType: ProblemType) => {
    setSelectedMentalMathProblemType(problemType);
    handleProblemTypeSelect(problemType);
  };

  return (
  <>
    <div className={`app${screen === 'results' ? ' app--results' : ''}`}>
      {screen === 'grades' && (
        <GradeSelector
          grades={grades}
          onSelect={handleGradeSelect}
          timerConfig={timerConfig}
          onTimerToggle={toggleTimer}
          onOpenTimerSettings={() => setShowTimerSettings(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'problemTypes' && selectedGrade && (
        <ProblemTypeSelector
          grade={selectedGrade}
          onSelect={handleProblemTypeSelect}
          onBack={handleBackToGrades}
          onPrintWorksheet={handleOpenWorksheetModal}
          onOpenMentalMathLibrary={handleOpenMentalMathLibrary}
          timerConfig={timerConfig}
          onTimerToggle={toggleTimer}
          onOpenTimerSettings={() => setShowTimerSettings(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'mentalMathLibrary' && selectedGrade && (
        <MentalMathLibrary
          grade={selectedGrade}
          activeProblemType={selectedMentalMathProblemType}
          onBack={handleBackToProblemTypes}
          onSelectProblemType={handleMentalMathProblemTypeSelect}
          onStartPractice={handleStartPracticeFromLibrary}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'quiz' && selectedProblemType && (
        <Quiz
          grade={selectedGrade!}
          problemType={selectedProblemType}
          onComplete={handleQuizComplete}
          onBack={handleBackToProblemTypes}
          timerConfig={timerConfig}
          theme={theme}
          onToggleTheme={toggleTheme}
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
          timerConfig={timerConfig}
          onTimerToggle={toggleTimer}
          onOpenTimerSettings={() => setShowTimerSettings(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
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
