import { useCallback, useRef, useState } from 'react';
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

function buildOptimisticResponse(
  previous: TutorResponse | null,
  userMessage: TutorMessage
): TutorResponse | null {
  if (!previous) {
    return null;
  }

  return {
    ...previous,
    messages: [...previous.messages, userMessage],
  };
}

function mergeTutorMessages(baseMessages: TutorMessage[], nextMessages: TutorMessage[]): TutorMessage[] {
  if (nextMessages.length === 0) {
    return baseMessages;
  }

  const hasBasePrefix = baseMessages.every((message, index) => {
    const nextMessage = nextMessages[index];
    return Boolean(
      nextMessage &&
        nextMessage.role === message.role &&
        nextMessage.content === message.content
    );
  });

  if (hasBasePrefix && nextMessages.length >= baseMessages.length) {
    return nextMessages;
  }

  return [...baseMessages, ...nextMessages];
}

export function useProblemTutor({ requestTutor = requestTutorApi }: UseProblemTutorOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProblem, setActiveProblem] = useState<TutorProblemContext | null>(null);
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const responseRef = useRef<TutorResponse | null>(null);
  const messagesRef = useRef<TutorMessage[]>([]);
  const sessionIdRef = useRef(0);
  const requestIdRef = useRef(0);

  const commitResponse = useCallback((nextResponse: TutorResponse | null) => {
    responseRef.current = nextResponse;
    setResponse(nextResponse);
  }, []);

  const commitMessages = useCallback((nextMessages: TutorMessage[]) => {
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  const closeTutor = useCallback(() => {
    sessionIdRef.current += 1;
    requestIdRef.current = 0;
    setIsOpen(false);
    setIsLoading(false);
    setActiveProblem(null);
    commitResponse(null);
    commitMessages([]);
    setError(null);
  }, [commitMessages, commitResponse]);

  const openTutor = useCallback(
    async (problem: TutorProblemContext) => {
      const sessionId = sessionIdRef.current + 1;
      sessionIdRef.current = sessionId;
      requestIdRef.current = 0;

      setActiveProblem(problem);
      setIsOpen(true);
      setIsLoading(true);
      setError(null);
      commitResponse(null);
      commitMessages([]);

      const requestId = 1;
      requestIdRef.current = requestId;

      try {
        const nextResponse = await requestTutor(buildTutorRequest(problem, []));
        if (sessionIdRef.current !== sessionId || requestIdRef.current !== requestId) {
          return;
        }

        commitResponse(nextResponse);
        commitMessages(nextResponse.messages);
      } catch (requestError) {
        if (sessionIdRef.current !== sessionId || requestIdRef.current !== requestId) {
          return;
        }

        setError(getErrorMessage(requestError));
      } finally {
        if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [commitResponse, requestTutor]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const problem = activeProblem;
      const currentResponse = responseRef.current;
      const currentMessages = messagesRef.current;

      if (!problem || !currentResponse) {
        return;
      }

      const userMessage: TutorMessage = { role: 'user', content };
      const optimisticMessages = [...currentMessages, userMessage];
      const optimisticResponse = buildOptimisticResponse(currentResponse, userMessage);
      if (!optimisticResponse) {
        return;
      }

      const sessionId = sessionIdRef.current;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      commitMessages(optimisticMessages);
      commitResponse(optimisticResponse);
      setIsLoading(true);
      setError(null);

      try {
        const nextResponse = await requestTutor(buildTutorRequest(problem, optimisticMessages));
        if (sessionIdRef.current !== sessionId || requestIdRef.current !== requestId) {
          return;
        }

        commitResponse(nextResponse);
        commitMessages(mergeTutorMessages(optimisticMessages, nextResponse.messages));
      } catch (requestError) {
        if (sessionIdRef.current !== sessionId || requestIdRef.current !== requestId) {
          return;
        }

        setError(getErrorMessage(requestError));
      } finally {
        if (sessionIdRef.current === sessionId && requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [activeProblem, commitResponse, requestTutor]
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
    response,
    messages,
    error,
    openTutor,
    sendMessage,
    closeTutor,
    resetTutor,
  };
}
