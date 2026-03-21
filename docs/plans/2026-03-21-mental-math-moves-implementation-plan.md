# Mental Math Moves Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable `Mental Math Moves` strategy system with grade- and topic-specific content, a dedicated strategy library, embedded tips in practice/results/worksheets, and tutor grounding.

**Architecture:** A typed strategy dataset will live in `src/data/mentalMathMoves/` and be resolved through helper functions in `src/lib/mentalMath/`. New presentational components will render compact or full guides across the existing app screens. Tutor prompt construction and worksheet rendering will consume the same shared guide data so the site teaches one consistent set of moves everywhere.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library

---

### Task 1: Add Strategy Types, Guide Data, And Lookup Helpers

**Files:**
- Create: `src/types/mentalMath.ts`
- Create: `src/data/mentalMathMoves/grade1.ts`
- Create: `src/data/mentalMathMoves/grade2.ts`
- Create: `src/data/mentalMathMoves/grade3.ts`
- Create: `src/data/mentalMathMoves/grade4.ts`
- Create: `src/data/mentalMathMoves/grade5.ts`
- Create: `src/data/mentalMathMoves/index.ts`
- Create: `src/lib/mentalMath/guides.ts`
- Test: `src/lib/mentalMath/guides.test.ts`

**Step 1: Write the failing tests**

Add lookup tests that prove the guide layer can:

- find a guide by `grade` and `problemTypeId`
- find a guide by `grade` and generated `problem.type`
- return `null` for unsupported combinations

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/mentalMath/guides.test.ts
```

Expected: FAIL because the guide types and lookup helpers do not exist yet

**Step 3: Write minimal implementation**

Add typed guide data for all current Grade 1-5 problem types. Keep the content concise but complete enough to support:

- compact tips
- full-topic study view
- worksheet strategy boxes
- tutor prompt summaries

Implement helpers for:

- `getMentalMathGuide(grade, problemTypeId)`
- `getMentalMathGuideForProblem(grade, problemType)`
- `summarizeMentalMathGuide(guide)`

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/lib/mentalMath/guides.test.ts
```

Expected: PASS

**Step 5: Run content review**

Run a `gpt-5.4` high-reasoning review over the drafted guide content before moving on. Fix any incorrect or weak strategies before the UI uses them.

### Task 2: Add Strategy Components And Library Screen

**Files:**
- Create: `src/components/mentalMath/MentalMathTipCard.tsx`
- Create: `src/components/mentalMath/MentalMathGuideView.tsx`
- Create: `src/components/mentalMath/MentalMathLibrary.tsx`
- Create: `src/components/mentalMath/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/ProblemTypeSelector.tsx`
- Modify: `src/types/index.ts`
- Test: `src/components/mentalMath/MentalMathLibrary.test.tsx`
- Test: `src/components/ProblemTypeSelector.test.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing tests**

Add component tests that prove:

- the library screen renders topic guides for a selected grade
- a student can navigate from the problem type selector into the guide view
- the selector still supports normal quiz navigation

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/components/mentalMath/MentalMathLibrary.test.tsx src/components/ProblemTypeSelector.test.tsx
```

Expected: FAIL because the strategy components and navigation do not exist yet

**Step 3: Write minimal implementation**

Extend the app screen state to include a strategy library view. Add a lightweight navigation path from `ProblemTypeSelector` into the library and a reusable guide renderer that can show:

- intro
- game plan
- core moves
- warm-up checklist
- common traps
- confidence note

Keep the existing quiz and worksheet actions intact.

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/components/mentalMath/MentalMathLibrary.test.tsx src/components/ProblemTypeSelector.test.tsx
```

Expected: PASS

### Task 3: Surface Embedded Tips In Quiz, Results, And Worksheets

**Files:**
- Modify: `src/components/Quiz.tsx`
- Modify: `src/components/Results.tsx`
- Modify: `src/components/worksheet/WorksheetPreview.tsx`
- Modify: `src/components/worksheet/WorksheetPrintView.tsx`
- Test: `src/components/Results.test.tsx`
- Test: `src/components/QuizMentalMath.test.tsx`
- Test: `src/components/worksheet/WorksheetPrintView.test.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing tests**

Add tests that prove:

- quiz view renders a `Today’s Tip` card for a regular topic
- results view shows a relevant move for an incorrect answer
- worksheet print output includes the strategy box for the active topic

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/components/Results.test.tsx src/components/QuizMentalMath.test.tsx src/components/worksheet/WorksheetPrintView.test.tsx
```

Expected: FAIL because the embedded strategy UI does not exist yet

**Step 3: Write minimal implementation**

Use the shared guide helpers to surface compact content in each screen. Prefer the first strong move and the game-plan language for tight spaces instead of rendering the full guide everywhere.

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/components/Results.test.tsx src/components/QuizMentalMath.test.tsx src/components/worksheet/WorksheetPrintView.test.tsx
```

Expected: PASS

### Task 4: Ground Tutor Prompts In Strategy Content

**Files:**
- Modify: `src/lib/tutor/prompt.ts`
- Modify: `src/lib/tutor/prompt.test.ts`
- Modify: `src/types/tutor.ts`

**Step 1: Write the failing tests**

Add prompt tests that prove the tutor request includes a compact strategy summary for the active topic and keeps using the supplied correct answer as truth.

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/tutor/prompt.test.ts
```

Expected: FAIL because the strategy summary is not included yet

**Step 3: Write minimal implementation**

Use the guide lookup helper in prompt construction and include only the compact summary needed to keep explanations aligned with the published moves.

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/lib/tutor/prompt.test.ts
```

Expected: PASS

### Task 5: Full Verification And Review

**Files:**
- Review only

**Step 1: Run focused tests**

Run all new or changed tests for the strategy feature.

**Step 2: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: PASS

**Step 3: Request code review**

Run the required review pass for the completed implementation before presenting the work as ready.
