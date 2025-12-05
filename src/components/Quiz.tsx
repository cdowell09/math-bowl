import { useState, useEffect } from 'react';
import { Problem, ProblemType } from '../types';

interface QuizProps {
  problemType: ProblemType;
  onComplete: (score: number, total: number, problems: Problem[], answers: (number | null)[]) => void;
  onBack: () => void;
}

const QUIZ_SIZE = 10;

const isSurpriseMe = (problemType: ProblemType) => problemType.id === 'surprise-me';

export function Quiz({ problemType, onComplete, onBack }: QuizProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<(string)[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: QUIZ_SIZE }, () => problemType.generate());
    setProblems(generated);
    setAnswers(Array(QUIZ_SIZE).fill(''));
  }, [problemType]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const numericAnswers = answers.map(a => a === '' ? null : parseFloat(a));
    const score = problems.reduce((acc, problem, i) => {
      const userAnswer = numericAnswers[i];
      if (userAnswer === null) return acc;
      // Use small epsilon for floating point comparison
      const isCorrect = Math.abs(userAnswer - problem.answer) < 0.001;
      return acc + (isCorrect ? 1 : 0);
    }, 0);
    onComplete(score, QUIZ_SIZE, problems, numericAnswers);
  };

  const allAnswered = answers.every(a => a !== '');

  return (
    <div className="quiz">
      <button className="back-button" onClick={onBack}>← Back</button>
      <h2>{problemType.name}</h2>
      <p className="quiz-instructions">{problemType.description}</p>

      <div className="problems-list">
        {problems.map((problem, index) => (
          <div key={problem.id} className="problem-row">
            <div className="problem-header">
              <span className="problem-number">{index + 1}.</span>
              {isSurpriseMe(problemType) && (
                <span className="problem-category">{problem.typeName}</span>
              )}
            </div>
            <span className="problem-display">
              {problem.display}
            </span>
            <input
              type="text"
              inputMode="numeric"
              className="answer-input"
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="?"
            />
          </div>
        ))}
      </div>

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!allAnswered}
      >
        Check My Answers!
      </button>
    </div>
  );
}
