import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PrintWorksheetModal } from './PrintWorksheetModal';
import type { GradeConfig, ProblemType } from '../../types';
import type { Worksheet, WorksheetModalContext } from '../../types/worksheet';

function makeGrade(): GradeConfig {
  return {
    grade: 4,
    name: 'Grade 4',
    problemTypes: [],
  };
}

function makeProblemType(): ProblemType {
  return {
    id: 'decimals',
    name: 'Decimals',
    description: 'Add and subtract decimal numbers',
    generate: () => ({
      id: crypto.randomUUID(),
      display: '0.29 + 0.15 =',
      answer: 0.44,
      type: 'decimals',
      typeName: 'Decimals',
    }),
  };
}

function makeContext(): WorksheetModalContext {
  const grade = makeGrade();
  const problemType = makeProblemType();

  return {
    source: 'problemTypeSelector',
    grade,
    problemType,
  };
}

function makeWorksheet(): Worksheet {
  return {
    title: 'Grade 4 - Decimals',
    grade: 4,
    problemTypeId: 'decimals',
    includeAnswerKey: true,
    problems: Array.from({ length: 10 }, (_, index) => ({
      id: `problem-${index + 1}`,
      display: `${index + 1}. 0.29 + 0.15 =`,
      answer: 0.44,
      type: 'decimals',
      typeName: 'Decimals',
    })),
  };
}

describe('PrintWorksheetModal', () => {
  it('wraps preview content in a scroll container so actions remain reachable', () => {
    const { container } = render(
      <PrintWorksheetModal
        isOpen
        context={makeContext()}
        worksheet={makeWorksheet()}
        onClose={vi.fn()}
        onGenerate={vi.fn()}
        onPrint={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /print worksheet/i })).toBeInTheDocument();
    expect(container.querySelector('.settings-modal-scroll')).not.toBeNull();
    expect(container.querySelector('.settings-modal--scrollable')).not.toBeNull();
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
  });
});
