import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorksheetPrintView } from './WorksheetPrintView';
import type { Worksheet } from '../../types/worksheet';

function makeWorksheet(): Worksheet {
  return {
    title: 'Grade 4 - Elapsed Time',
    grade: 4,
    problemTypeId: 'elapsedTime',
    problems: [
      {
        id: 'problem-1',
        display: '2:35 to 4:10 =',
        answer: 95,
        type: 'elapsedTime',
        typeName: 'Elapsed Time',
      },
    ],
    includeAnswerKey: true,
  };
}

describe('WorksheetPrintView', () => {
  it('includes a fast ways to think section for the worksheet topic', () => {
    render(<WorksheetPrintView worksheet={makeWorksheet()} />);

    expect(screen.getByText(/fast ways to think/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Jump to the Next Hour/i).length).toBeGreaterThan(0);
  });
});
