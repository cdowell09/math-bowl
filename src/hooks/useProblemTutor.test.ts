import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProblemTutor } from './useProblemTutor';
import type { TutorRequest, TutorResponse } from '../types/tutor';

describe('useProblemTutor', () => {
  it('loads an opening tutor response when a problem is opened', async () => {
    const requestTutor = vi.fn(async (_request: TutorRequest): Promise<TutorResponse> => ({
      summary: 'Let us look at the problem together.',
      hint: 'Start with the ones place.',
      nextQuestion: 'What is 5 + 3?',
      workedExample: null,
      messages: [{ role: 'assistant', content: 'Let us look at the problem together.' }],
    }));

    const { result } = renderHook(() =>
      useProblemTutor({
        requestTutor,
      })
    );

    await act(async () => {
      await result.current.openTutor({
        grade: 1,
        problemType: 'Addition',
        problemDisplay: '5 + 3 =',
        correctAnswer: 8,
        studentAnswer: 6,
      });
    });

    await waitFor(() => {
      expect(result.current.isOpen).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toEqual({
      role: 'assistant',
      content: 'Let us look at the problem together.',
    });
    expect(requestTutor).toHaveBeenCalledWith({
      grade: 1,
      problemType: 'Addition',
      problemDisplay: '5 + 3 =',
      correctAnswer: 8,
      studentAnswer: 6,
      messages: [],
    });
  });

  it('sends follow-up messages with the active conversation history', async () => {
    const requestTutor = vi.fn(async (request: TutorRequest): Promise<TutorResponse> => ({
      summary: request.messages.length > 1 ? 'Nice, you found the next step.' : 'Let us look at the problem together.',
      hint: null,
      nextQuestion: null,
      workedExample: null,
      messages: [
        {
          role: 'assistant',
          content: request.messages.length > 1
            ? 'Nice, you found the next step.'
            : 'Let us look at the problem together.',
        },
      ],
    }));

    const { result } = renderHook(() =>
      useProblemTutor({
        requestTutor,
      })
    );

    await act(async () => {
      await result.current.openTutor({
        grade: 2,
        problemType: 'Addition',
        problemDisplay: '9 + 4 =',
        correctAnswer: 13,
        studentAnswer: 11,
      });
    });

    await act(async () => {
      await result.current.sendMessage('I counted 9, 10, 11, 12.');
    });

    expect(requestTutor).toHaveBeenLastCalledWith({
      grade: 2,
      problemType: 'Addition',
      problemDisplay: '9 + 4 =',
      correctAnswer: 13,
      studentAnswer: 11,
      messages: [
        { role: 'assistant', content: 'Let us look at the problem together.' },
        { role: 'user', content: 'I counted 9, 10, 11, 12.' },
      ],
    });
    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Let us look at the problem together.' },
      { role: 'user', content: 'I counted 9, 10, 11, 12.' },
      { role: 'assistant', content: 'Nice, you found the next step.' },
    ]);
  });
});
