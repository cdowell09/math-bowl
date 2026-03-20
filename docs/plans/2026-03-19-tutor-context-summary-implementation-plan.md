# Tutor Context Summary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the stacked Torch context cards with a compact summary line so the chat stays visible, especially on mobile.

**Architecture:** Keep the existing `TutorPanel` data flow and behavior, but swap the bulky context grid for a single summary section in the header area. Update tests first so the UI contract changes are intentional and covered.

**Tech Stack:** React 18, TypeScript, Vite, plain CSS, Vitest, Testing Library

---

### Task 1: Lock In The Compact Summary With A Failing Test

**Files:**
- Modify: `src/components/Results.test.tsx`

**Step 1: Write the failing test**

Add a test that opens Torch and expects a compact summary string containing the problem, student answer, and correct answer. Also assert the old card labels do not render as separate context blocks.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Results.test.tsx`

Expected: FAIL because the tutor still renders stacked context cards.

### Task 2: Replace The Context Grid With A Compact Summary

**Files:**
- Modify: `src/components/TutorPanel.tsx`
- Modify: `src/index.css`

**Step 1: Write minimal implementation**

- Remove the three-card context grid.
- Add a compact summary element near the panel header.
- Update CSS so the new summary reads clearly and frees space for the message list.

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/Results.test.tsx`

Expected: PASS

### Task 3: Verify The Fix End To End

**Files:**
- No code changes expected

**Step 1: Run targeted tutor tests**

Run: `npm test -- src/components/Results.test.tsx src/hooks/useProblemTutor.test.ts src/services/tutorService.test.ts`

Expected: PASS

**Step 2: Run the production build**

Run: `npm run build`

Expected: PASS
