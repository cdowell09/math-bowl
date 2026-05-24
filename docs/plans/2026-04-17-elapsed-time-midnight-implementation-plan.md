# Elapsed Time Midnight Crossing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix grade 4 elapsed-time generation so midnight crossings display the correct periods and compute the correct elapsed minutes.

**Architecture:** Extract a small helper that builds an elapsed-time problem from explicit start and end clock values. The generator will use that helper so deterministic tests can verify same-period and midnight-crossing behavior without depending on random sequences.

**Tech Stack:** TypeScript, Vitest, Vite

---

### Task 1: Lock in the bug with a failing test

**Files:**
- Modify: `src/generators/grade4/elapsedTime.test.ts`
- Test: `src/generators/grade4/elapsedTime.test.ts`

**Step 1: Write the failing test**

Add a test that builds a problem for `8:45 p.m.` to `1:00 a.m.` and expects:
- display: `8:45 p.m. to 1:00 a.m. = ___`
- answer: `255`

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/generators/grade4/elapsedTime.test.ts`

Expected: FAIL because the helper does not exist yet.

### Task 2: Implement the minimal fix

**Files:**
- Modify: `src/generators/grade4/elapsedTime.ts`

**Step 1: Add a small helper**

Create a helper that:
- accepts explicit start and end hour/minute/period values
- formats the prompt
- converts both times into comparable minute offsets
- treats wrapped end times as next-day times

**Step 2: Update random generation**

Use separate start/end periods when the generated problem crosses between periods, including the `p.m.` to `a.m.` midnight case.

### Task 3: Verify

**Files:**
- Modify: `src/generators/grade4/elapsedTime.ts`
- Modify: `src/generators/grade4/elapsedTime.test.ts`

**Step 1: Run targeted tests**

Run: `npx vitest run src/generators/grade4/elapsedTime.test.ts`

Expected: PASS

**Step 2: Run supporting elapsed-time tests**

Run: `npx vitest run src/lib/elapsedTime.test.ts`

Expected: PASS
