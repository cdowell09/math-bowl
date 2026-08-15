import { useCallback, useRef, useState } from 'react';
import type { TutorMessage, TutorProblemContext, TutorRequest, TutorResponse } from '../types/tutor';
import { requestTutor as requestTutorApi } from '../services/tutorService';

interface UseProblemTutorOptions {
  requestTutor?: (request: TutorRequest) => Promise<TutorResponse>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim() ? error.message : 'Tutor request failed';
}

function mergeTutorMessages(base: TutorMessage[], next: TutorMessage[]): TutorMessage[] {
  const hasBasePrefix = base.every(
    (message, index) =>
      next[index]?.role === message.role && next[index]?.content === message.content
  );
  return hasBasePrefix && next.length >= base.length ? next : [...base, ...next];
}

export function useProblemTutor({ requestTutor = requestTutorApi }: UseProblemTutorOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProblem, setActiveProblem] = useState<TutorProblemContext | null>(null);
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const responseRef = useRef<TutorResponse | null>(null);
  const sessionIdRef = useRef(0);
  const requestIdRef = useRef(0);

  const commitResponse = useCallback((next: TutorResponse | null) => {
    responseRef.current = next;
    setResponse(next);
  }, []);

  const closeTutor = useCallback(() => {
    sessionIdRef.current += 1;
    requestIdRef.current = 0;
    setIsOpen(false);
    setIsLoading(false);
    setActiveProblem(null);
    commitResponse(null);
    setError(null);
  }, [commitResponse]);

  const openTutor = useCallback(async (problem: TutorProblemContext) => {
    const sessionId = ++sessionIdRef.current;
    const requestId = requestIdRef.current = 1;

    setActiveProblem(problem);
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    commitResponse(null);

    try {
      const next = await requestTutor({ ...problem, messages: [] });
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        commitResponse(next);
      }
    } catch (requestError) {
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [commitResponse, requestTutor]);

  const sendMessage = useCallback(async (content: string) => {
    const problem = activeProblem;
    const current = responseRef.current;
    if (!problem || !current) return;

    const optimistic: TutorResponse = {
      ...current,
      messages: [...current.messages, { role: 'user', content }],
    };
    const sessionId = sessionIdRef.current;
    const requestId = ++requestIdRef.current;

    commitResponse(optimistic);
    setIsLoading(true);
    setError(null);

    try {
      const next = await requestTutor({ ...problem, messages: optimistic.messages });
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        commitResponse({
          ...next,
          messages: mergeTutorMessages(optimistic.messages, next.messages),
        });
      }
    } catch (requestError) {
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [activeProblem, commitResponse, requestTutor]);

  const resetTutor = useCallback(() => {
    if (activeProblem) void openTutor(activeProblem);
    else closeTutor();
  }, [activeProblem, closeTutor, openTutor]);

  return {
    isOpen,
    isLoading,
    activeProblem,
    response,
    messages: response?.messages ?? [],
    error,
    openTutor,
    sendMessage,
    closeTutor,
    resetTutor,
  };
}
