import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProblemTutor } from './useProblemTutor';
import type { TutorRequest, TutorResponse } from '../types/tutor';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

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
    expect(result.current.response).toEqual({
      summary: 'Let us look at the problem together.',
      hint: 'Start with the ones place.',
      nextQuestion: 'What is 5 + 3?',
      workedExample: null,
      messages: [{ role: 'assistant', content: 'Let us look at the problem together.' }],
    });
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

  it('ignores stale open responses when switching problems quickly', async () => {
    const first = createDeferred<TutorResponse>();
    const second = createDeferred<TutorResponse>();
    const requestTutor = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);

    const { result } = renderHook(() =>
      useProblemTutor({
        requestTutor,
      })
    );

    await act(async () => {
      void result.current.openTutor({
        grade: 1,
        problemType: 'Addition',
        problemDisplay: '2 + 2 =',
        correctAnswer: 4,
        studentAnswer: 3,
      });
      void result.current.openTutor({
        grade: 2,
        problemType: 'Subtraction',
        problemDisplay: '9 - 4 =',
        correctAnswer: 5,
        studentAnswer: 6,
      });
    });

    await act(async () => {
      second.resolve({
        summary: 'Second problem',
        hint: null,
        nextQuestion: null,
        workedExample: null,
        messages: [{ role: 'assistant', content: 'Second problem' }],
      });
    });

    await waitFor(() => {
      expect(result.current.response?.summary).toBe('Second problem');
    });

    await act(async () => {
      first.resolve({
        summary: 'First problem',
        hint: null,
        nextQuestion: null,
        workedExample: null,
        messages: [{ role: 'assistant', content: 'First problem' }],
      });
    });

    expect(result.current.response?.summary).toBe('Second problem');
    expect(result.current.activeProblem?.problemDisplay).toBe('9 - 4 =');
  });

  it('keeps the latest follow-up response when messages overlap', async () => {
    const followUpOne = createDeferred<TutorResponse>();
    const followUpTwo = createDeferred<TutorResponse>();
    const requestTutor = vi
      .fn()
      .mockResolvedValueOnce({
        summary: 'Start here',
        hint: null,
        nextQuestion: null,
        workedExample: null,
        messages: [{ role: 'assistant', content: 'Start here' }],
      })
      .mockImplementationOnce(() => followUpOne.promise)
      .mockImplementationOnce(() => followUpTwo.promise);

    const { result } = renderHook(() =>
      useProblemTutor({
        requestTutor,
      })
    );

    await act(async () => {
      await result.current.openTutor({
        grade: 3,
        problemType: 'Addition',
        problemDisplay: '4 + 7 =',
        correctAnswer: 11,
        studentAnswer: 10,
      });
    });

    await act(async () => {
      void result.current.sendMessage('I counted to 10.');
      void result.current.sendMessage('I tried again and got 11.');
    });

    await act(async () => {
      followUpTwo.resolve({
        summary: 'Latest follow-up',
        hint: null,
        nextQuestion: null,
        workedExample: null,
        messages: [
          { role: 'assistant', content: 'Start here' },
          { role: 'user', content: 'I counted to 10.' },
          { role: 'user', content: 'I tried again and got 11.' },
          { role: 'assistant', content: 'Latest follow-up' },
        ],
      });
    });

    await waitFor(() => {
      expect(result.current.response?.summary).toBe('Latest follow-up');
    });

    await act(async () => {
      followUpOne.resolve({
        summary: 'Old follow-up',
        hint: null,
        nextQuestion: null,
        workedExample: null,
        messages: [
          { role: 'assistant', content: 'Start here' },
          { role: 'user', content: 'I counted to 10.' },
          { role: 'assistant', content: 'Old follow-up' },
        ],
      });
    });

    expect(result.current.response?.summary).toBe('Latest follow-up');
    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Start here' },
      { role: 'user', content: 'I counted to 10.' },
      { role: 'user', content: 'I tried again and got 11.' },
      { role: 'assistant', content: 'Latest follow-up' },
    ]);
  });
});
