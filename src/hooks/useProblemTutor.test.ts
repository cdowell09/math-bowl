import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProblemTutor } from './useProblemTutor';
import type { TutorMessage, TutorRequest, TutorResponse } from '../types/tutor';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
}

const response = (
  content: string,
  messages: TutorMessage[] = [{ role: 'assistant', content }]
): TutorResponse => ({
  messages,
});

const problem = {
  grade: 1,
  problemType: 'Addition',
  problemDisplay: '5 + 3 =',
  correctAnswer: 8,
  studentAnswer: 6,
};

describe('useProblemTutor', () => {
  it('loads an opening tutor response when a problem is opened', async () => {
    const requestTutor = vi.fn(async () => response('Let us look at the problem together.'));
    const { result } = renderHook(() => useProblemTutor({ requestTutor }));

    await act(async () => result.current.openTutor(problem));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.messages).toEqual([
      { role: 'assistant', content: 'Let us look at the problem together.' },
    ]);
    expect(requestTutor).toHaveBeenCalledWith({ ...problem, messages: [] });
  });

  it('sends follow-up messages with the active conversation history', async () => {
    const requestTutor = vi.fn(async (request: TutorRequest) =>
      response(request.messages.length ? 'Nice, you found the next step.' : 'Let us look at the problem together.')
    );
    const { result } = renderHook(() => useProblemTutor({ requestTutor }));

    await act(async () => result.current.openTutor(problem));
    await act(async () => result.current.sendMessage('I counted 9, 10, 11, 12.'));

    expect(requestTutor).toHaveBeenLastCalledWith({
      ...problem,
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
    const requestTutor = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const { result } = renderHook(() => useProblemTutor({ requestTutor }));

    await act(async () => {
      void result.current.openTutor({ ...problem, problemDisplay: '2 + 2 =' });
      void result.current.openTutor({ ...problem, problemDisplay: '9 - 4 =' });
    });
    await act(async () => second.resolve(response('Second problem')));
    await waitFor(() => expect(result.current.messages[0]?.content).toBe('Second problem'));
    await act(async () => first.resolve(response('First problem')));

    expect(result.current.messages[0]?.content).toBe('Second problem');
    expect(result.current.activeProblem?.problemDisplay).toBe('9 - 4 =');
  });

  it('keeps the latest follow-up response when messages overlap', async () => {
    const followUpOne = createDeferred<TutorResponse>();
    const followUpTwo = createDeferred<TutorResponse>();
    const requestTutor = vi.fn()
      .mockResolvedValueOnce(response('Start here'))
      .mockImplementationOnce(() => followUpOne.promise)
      .mockImplementationOnce(() => followUpTwo.promise);
    const { result } = renderHook(() => useProblemTutor({ requestTutor }));

    await act(async () => result.current.openTutor(problem));
    await act(async () => {
      void result.current.sendMessage('I counted to 10.');
      void result.current.sendMessage('I tried again and got 11.');
    });

    const latestMessages = [
      { role: 'assistant' as const, content: 'Start here' },
      { role: 'user' as const, content: 'I counted to 10.' },
      { role: 'user' as const, content: 'I tried again and got 11.' },
      { role: 'assistant' as const, content: 'Latest follow-up' },
    ];
    await act(async () => followUpTwo.resolve(response('Latest follow-up', latestMessages)));
    await waitFor(() => expect(result.current.messages[result.current.messages.length - 1]?.content).toBe('Latest follow-up'));
    await act(async () => followUpOne.resolve(response('Old follow-up')));

    expect(result.current.messages).toEqual(latestMessages);
  });
});
