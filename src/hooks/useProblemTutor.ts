import { useCallback, useState } from 'react';
import type { TutorMessage, TutorProblemContext, TutorRequest, TutorResponse } from '../types/tutor';
import { requestTutor as requestTutorApi } from '../services/tutorService';

interface UseProblemTutorOptions {
  requestTutor?: (request: TutorRequest) => Promise<TutorResponse>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return 'Tutor request failed';
}

function buildTutorRequest(problem: TutorProblemContext, messages: TutorMessage[]): TutorRequest {
  return {
    ...problem,
    messages,
  };
}

export function useProblemTutor({ requestTutor = requestTutorApi }: UseProblemTutorOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProblem, setActiveProblem] = useState<TutorProblemContext | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const closeTutor = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setActiveProblem(null);
    setMessages([]);
    setError(null);
  }, []);

  const openTutor = useCallback(
    async (problem: TutorProblemContext) => {
      setActiveProblem(problem);
      setIsOpen(true);
      setIsLoading(true);
      setError(null);
      setMessages([]);

      try {
        const response = await requestTutor(buildTutorRequest(problem, []));
        setMessages(response.messages);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [requestTutor]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeProblem) {
        return;
      }

      const nextMessages = [
        ...messages,
        {
          role: 'user',
          content,
        } as const,
      ];

      setIsLoading(true);
      setError(null);

      try {
        const response = await requestTutor(buildTutorRequest(activeProblem, nextMessages));
        setMessages([...nextMessages, ...response.messages]);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [activeProblem, messages, requestTutor]
  );

  const resetTutor = useCallback(() => {
    if (!activeProblem) {
      closeTutor();
      return;
    }

    void openTutor(activeProblem);
  }, [activeProblem, closeTutor, openTutor]);

  return {
    isOpen,
    isLoading,
    activeProblem,
    messages,
    error,
    openTutor,
    sendMessage,
    closeTutor,
    resetTutor,
  };
}
