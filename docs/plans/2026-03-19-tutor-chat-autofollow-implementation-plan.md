# Tutor Chat Auto-Follow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Torch keep the latest chat turn in view by default without overriding a user who scrolls up to read earlier messages.

**Architecture:** The scroll-follow logic lives entirely in `TutorPanel`, attached to the `.tutor-message-list` element with a ref, a bottom-proximity check, and an `onScroll` handler. Tests should exercise the rendered component directly so the behavior is verified against DOM scrolling state rather than inferred from hook state.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, jsdom

---

### Task 1: Add A Failing TutorPanel Auto-Follow Test

**Files:**
- Create: `src/components/TutorPanel.test.tsx`

**Step 1: Write the failing test**

Render `TutorPanel` with a visible problem and an initial message list. Mock the scroll container metrics and assert:

- `scrollTo` is called when the panel opens or a new message arrives while the list is near the bottom.
- `scrollTo` is not called after the user scrolls upward and another message arrives.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/TutorPanel.test.tsx`

Expected: FAIL because the panel does not manage scroll position yet.

### Task 2: Implement Scroll Follow In TutorPanel

**Files:**
- Modify: `src/components/TutorPanel.tsx`

**Step 1: Write minimal implementation**

- Add a ref for the message list element.
- Track whether the user is near the bottom.
- Scroll the message list to `top: scrollHeight` when the panel opens or the visible message/loading count changes and auto-follow is still active.
- Update the near-bottom tracking on `scroll`.

**Step 2: Run test to verify it passes**

Run: `npm test -- src/components/TutorPanel.test.tsx`

Expected: PASS

### Task 3: Verify Tutor Regressions

**Files:**
- No code changes expected

**Step 1: Run targeted tests**

Run: `npm test -- src/components/TutorPanel.test.tsx src/components/Results.test.tsx src/hooks/useProblemTutor.test.ts src/services/tutorService.test.ts`

Expected: PASS

**Step 2: Run the production build**

Run: `npm run build`

Expected: PASS
