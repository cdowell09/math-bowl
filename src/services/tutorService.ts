import type { TutorMessage, TutorRequest, TutorResponse } from '../types/tutor';

function normalizeMessages(messages: unknown): TutorMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.flatMap((message) => {
    if (!message || typeof message !== 'object') {
      return [];
    }

    const record = message as Record<string, unknown>;
    if (record.role !== 'user' && record.role !== 'assistant') {
      return [];
    }

    if (typeof record.content !== 'string') {
      return [];
    }

    return [{ role: record.role, content: record.content }];
  });
}

function normalizeTutorResponse(data: unknown): TutorResponse {
  if (!data || typeof data !== 'object') return { messages: [] };

  const record = data as Record<string, unknown>;
  return {
    mode: record.mode === 'fallback' ? 'fallback' : 'live',
    fallbackReason: typeof record.fallbackReason === 'string' ? record.fallbackReason : null,
    messages: normalizeMessages(record.messages),
  };
}

export async function requestTutor(request: TutorRequest): Promise<TutorResponse> {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = `Tutor request failed with ${response.status}`;

    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === 'string' && data.error.trim() !== '') {
        errorMessage = data.error;
      }
    } catch {
      // Ignore parsing errors and use the generic message.
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return normalizeTutorResponse(data);
}
