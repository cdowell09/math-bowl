# Results Half-Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the results screen behave cleanly at half-screen widths when the tutor panel is open.

**Architecture:** Keep the existing results/tutor structure and solve the issue in CSS. Stack the tutor panel earlier at medium widths, and relax the result-row layout so answer text and the tutor button can wrap without colliding.

**Tech Stack:** React, TypeScript, Vite, plain CSS, Vitest, Testing Library

---

### Task 1: Add the responsive regression fix

**Files:**
- Modify: `src/index.css`

**Step 1: Identify the failing layout behavior**

Review the current results/tutor styles and confirm that the two-column shell remains active too long and that result rows do not wrap cleanly at mid-widths.

**Step 2: Write the minimal CSS changes**

- Add a medium-width breakpoint that switches `.results-shell--with-tutor` to a column layout.
- Convert the tutor panel from sticky side panel to normal flow within that breakpoint.
- Let `.result-row` wrap and allow `.result-answer` plus `.problem-tutor-button` to move onto a new line when needed.

**Step 3: Verify the CSS still preserves mobile behavior**

Check that the existing mobile breakpoint still applies the fixed-bottom tutor panel and full-width tutor buttons.

### Task 2: Verify the change

**Files:**
- Test: `src/components/Results.test.tsx`

**Step 1: Run targeted component tests**

Run: `npm test -- --run src/components/Results.test.tsx`

Expected: Results-related tests pass.

**Step 2: Run the production build**

Run: `npm run build`

Expected: Type-check and Vite build complete successfully.
