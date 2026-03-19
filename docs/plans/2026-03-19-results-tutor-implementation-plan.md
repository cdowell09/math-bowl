# Results Tutor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an optional, one-problem-at-a-time tutoring panel on the results screen that explains missed problems using a server-owned OpenRouter integration.

**Architecture:** The React app will open a tutor panel from incorrect result rows and call a Vercel serverless route for tutoring responses. The backend validates requests, builds a tightly scoped prompt, calls OpenRouter, and returns a structured response with a safe fallback path.

**Tech Stack:** React 18, TypeScript, Vite, Vercel serverless functions, OpenRouter, Vitest, Testing Library

---

### Task 1: Add Test Tooling And Tutor Types

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/types/tutor.ts`
- Create: `src/test/setup.ts`
- Create: `vitest.config.ts`

**Step 1: Write the failing test setup import**

Add a minimal shared type and a smoke test target that will be used by later tasks:

```ts
// src/types/tutor.ts
export interface TutorRequest {
  grade: number;
  problemType: string;
  problemDisplay: string;
  correctAnswer: number;
  studentAnswer: number | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}
```

**Step 2: Run test command to verify the repo does not support it yet**

Run: `npm test`

Expected: command fails because no test script exists yet

**Step 3: Write minimal implementation**

Install and configure:

- `vitest`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Add setup file:

```ts
import '@testing-library/jest-dom';
```

Add config:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**Step 4: Run tests to verify tooling works**

Run: `npm test`

Expected: test runner starts successfully even if no application tests exist yet

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/types/tutor.ts
git commit -m "test(tutor): add tutoring test setup"
```

### Task 2: Build Server-Side Tutor Contract And Validation

**Files:**
- Create: `api/tutor.ts`
- Create: `src/lib/tutor/validation.ts`
- Create: `src/lib/tutor/prompt.ts`
- Create: `src/lib/tutor/fallback.ts`
- Create: `src/lib/tutor/openRouterClient.ts`
- Test: `src/lib/tutor/validation.test.ts`
- Test: `src/lib/tutor/prompt.test.ts`

**Step 1: Write the failing tests**

Add validation coverage:

```ts
import { describe, expect, it } from 'vitest';
import { validateTutorRequest } from './validation';

describe('validateTutorRequest', () => {
  it('accepts a valid tutoring request', () => {
    expect(() =>
      validateTutorRequest({
        grade: 4,
        problemType: 'Decimals',
        problemDisplay: '2.5 + 1.5 =',
        correctAnswer: 4,
        studentAnswer: 3,
        messages: [],
      })
    ).not.toThrow();
  });
});
```

Add prompt coverage:

```ts
import { describe, expect, it } from 'vitest';
import { buildTutorPrompt } from './prompt';

it('grounds the tutor in the provided correct answer', () => {
  const prompt = buildTutorPrompt({
    grade: 2,
    problemType: 'Adding Money',
    problemDisplay: 'Q + D =',
    correctAnswer: 35,
    studentAnswer: 30,
    messages: [],
  });

  expect(prompt.system).toContain('use the provided correct answer as truth');
  expect(prompt.user).toContain('Correct answer: 35');
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/tutor/validation.test.ts src/lib/tutor/prompt.test.ts
```

Expected: FAIL because the tutor modules do not exist yet

**Step 3: Write minimal implementation**

Validation should enforce:

```ts
if (!Number.isFinite(input.grade) || input.grade < 1 || input.grade > 5) {
  throw new Error('Invalid grade');
}
if (!Number.isFinite(input.correctAnswer)) {
  throw new Error('Invalid correct answer');
}
```

Prompt builder should produce a narrow contract:

```ts
return {
  system: [
    'You are an elementary math coach.',
    'Explain only the selected problem.',
    'Use the provided correct answer as truth.',
    'Ask at most one follow-up question at a time.',
    'If uncertain, say so simply instead of guessing.',
  ].join(' '),
  user: [
    `Grade: ${request.grade}`,
    `Problem type: ${request.problemType}`,
    `Problem: ${request.problemDisplay}`,
    `Correct answer: ${request.correctAnswer}`,
    `Student answer: ${request.studentAnswer ?? 'No answer given'}`,
  ].join('\n'),
};
```

The Vercel route should:

- accept `POST`
- validate JSON input
- call the OpenRouter client with `stepfun/step-3.5-flash:free`
- normalize the provider response
- return fallback JSON on error

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/lib/tutor/validation.test.ts src/lib/tutor/prompt.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add api/tutor.ts src/lib/tutor/validation.ts src/lib/tutor/prompt.ts src/lib/tutor/fallback.ts src/lib/tutor/openRouterClient.ts src/lib/tutor/validation.test.ts src/lib/tutor/prompt.test.ts
git commit -m "feat(tutor): add backend tutoring contract"
```

### Task 3: Add Frontend Tutor Service And State Hook

**Files:**
- Create: `src/services/tutorService.ts`
- Create: `src/hooks/useProblemTutor.ts`
- Test: `src/hooks/useProblemTutor.test.ts`
- Modify: `src/types/tutor.ts`

**Step 1: Write the failing hook test**

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useProblemTutor } from './useProblemTutor';

it('loads an opening tutor response for a selected problem', async () => {
  const requestTutor = vi.fn().mockResolvedValue({
    messages: [{ role: 'assistant', content: 'Let us solve it step by step.' }],
  });

  const { result } = renderHook(() => useProblemTutor({ requestTutor }));

  await act(async () => {
    await result.current.openTutor({
      grade: 1,
      problemType: 'Addition',
      problemDisplay: '8 + 5 =',
      correctAnswer: 13,
      studentAnswer: 12,
    });
  });

  expect(result.current.messages[0]?.content).toContain('step by step');
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/hooks/useProblemTutor.test.ts
```

Expected: FAIL because the hook and service do not exist yet

**Step 3: Write minimal implementation**

Service:

```ts
export async function requestTutor(request: TutorRequest): Promise<TutorResponse> {
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error('Tutor request failed');
  return response.json();
}
```

Hook responsibilities:

- store the active problem context
- request an opening tutor message on open
- send follow-up messages
- expose `isOpen`, `isLoading`, `messages`, `error`, `closeTutor`, and `resetTutor`

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/hooks/useProblemTutor.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/services/tutorService.ts src/hooks/useProblemTutor.ts src/hooks/useProblemTutor.test.ts src/types/tutor.ts
git commit -m "feat(tutor): add frontend tutoring state"
```

### Task 4: Add Results-Screen Tutor UI

**Files:**
- Modify: `src/components/Results.tsx`
- Create: `src/components/ProblemTutorButton.tsx`
- Create: `src/components/TutorPanel.tsx`
- Test: `src/components/Results.test.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing component test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Results } from './Results';

it('shows a help button for incorrect answers only', async () => {
  render(/* Results props with one correct and one incorrect answer */);

  expect(screen.getAllByRole('button', { name: /help me with this one/i })).toHaveLength(1);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/Results.test.tsx
```

Expected: FAIL because the tutor UI does not exist yet

**Step 3: Write minimal implementation**

`Results.tsx` should:

- render `ProblemTutorButton` only for incorrect rows
- initialize `useProblemTutor`
- pass the selected problem to `TutorPanel`

The new panel should show:

- problem display
- student answer
- correct answer
- message list
- composer input
- loading state
- close and reset actions

Desktop CSS should create a two-column layout around the results content. Mobile CSS should convert the panel into a bottom drawer.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/Results.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Results.tsx src/components/ProblemTutorButton.tsx src/components/TutorPanel.tsx src/components/Results.test.tsx src/index.css
git commit -m "feat(results): add optional tutoring panel"
```

### Task 5: Add Feature Flag, Docs, And Final Verification

**Files:**
- Modify: `README.md`
- Modify: `src/lib/tutor/openRouterClient.ts`
- Test: `src/lib/tutor/openRouterClient.test.ts`
- Optional: `.env.example`

**Step 1: Write the failing client test**

```ts
import { describe, expect, it } from 'vitest';
import { createTutorHeaders } from './openRouterClient';

it('includes the OpenRouter auth header', () => {
  expect(createTutorHeaders('test-key')).toEqual(
    expect.objectContaining({
      Authorization: 'Bearer test-key',
    })
  );
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/tutor/openRouterClient.test.ts
```

Expected: FAIL because the helper is not exposed yet

**Step 3: Write minimal implementation**

Expose helpers for:

- auth header creation
- provider model selection
- environment flag checks such as `VITE_ENABLE_RESULTS_TUTOR`

Document:

- required secret like `OPENROUTER_API_KEY`
- optional feature flag
- how to test locally
- how the fallback behavior works

**Step 4: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS

**Step 5: Commit**

```bash
git add README.md src/lib/tutor/openRouterClient.ts src/lib/tutor/openRouterClient.test.ts .env.example
git commit -m "docs(tutor): document setup and verification"
```
