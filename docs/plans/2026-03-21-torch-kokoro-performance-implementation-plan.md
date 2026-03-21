# Torch Kokoro Performance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve Torch's first-run Kokoro experience by preloading on tutor open, exposing real progress, moving Kokoro work off the main thread, and automatically preferring WebGPU when available.

**Architecture:** The React app will treat TTS as a worker-backed runtime. `useTutorTts` will orchestrate preload, playback, backend choice, and fallback state, while a dedicated worker owns Kokoro initialization, progress events, and audio generation. The worker will try `webgpu` first, fall back to `wasm`, and keep device speech as the final fallback path.

**Tech Stack:** React 18, TypeScript, Vite web workers, Vitest, Testing Library, `kokoro-js`

---

### Task 1: Extend The Engine Contract For Preload, Progress, And Backend Selection

**Files:**
- Modify: `src/lib/tutor/tts/kokoroEngine.ts`
- Modify: `src/lib/tutor/tts/kokoroEngine.test.ts`

**Step 1: Write the failing test**

Add a test that proves the engine can report readiness and backend choice:

```ts
it('tries webgpu first and falls back to wasm', async () => {
  // mock webgpu failure, wasm success, assert chosen backend is wasm
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/tutor/tts/kokoroEngine.test.ts
```

Expected: FAIL because the engine does not yet expose backend selection or progress-aware preload behavior

**Step 3: Write minimal implementation**

- extend the engine surface with:
  - `preload()`
  - `isReady()`
  - progress callback support
  - backend choice reporting
- implement `webgpu` first, then `wasm`

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/tutor/tts/kokoroEngine.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/tutor/tts/kokoroEngine.ts src/lib/tutor/tts/kokoroEngine.test.ts
git commit -m "feat(tutor): add kokoro preload and backend selection"
```

### Task 2: Introduce A Worker-Backed Kokoro Runtime

**Files:**
- Create: `src/lib/tutor/tts/kokoroWorker.ts`
- Create: `src/lib/tutor/tts/workerBackedKokoroEngine.ts`
- Create: `src/lib/tutor/tts/workerBackedKokoroEngine.test.ts`

**Step 1: Write the failing test**

```ts
it('forwards preload and progress events through the worker boundary', async () => {
  // mock Worker, emit progress/ready messages, assert engine state updates
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/tutor/tts/workerBackedKokoroEngine.test.ts
```

Expected: FAIL because the worker-backed runtime does not exist yet

**Step 3: Write minimal implementation**

- create a Vite worker that:
  - handles `preload`, `speak`, and `stop`
  - reports `progress`, `ready`, `audio`, `error`, and `backend-selected`
- add a main-thread wrapper that exposes the existing engine-style API plus progress subscriptions

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/tutor/tts/workerBackedKokoroEngine.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/tutor/tts/kokoroWorker.ts src/lib/tutor/tts/workerBackedKokoroEngine.ts src/lib/tutor/tts/workerBackedKokoroEngine.test.ts
git commit -m "feat(tutor): add worker-backed kokoro runtime"
```

### Task 3: Upgrade The Tutor TTS Hook To Preload On Open And Surface Progress

**Files:**
- Modify: `src/hooks/useTutorTts.ts`
- Modify: `src/hooks/useTutorTts.test.ts`

**Step 1: Write the failing test**

```ts
it('starts preloading when enabled and exposes progress text', async () => {
  // enable hook, emit progress from mocked engine, assert status message changes
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts
```

Expected: FAIL because preload-on-open and progress messaging do not exist yet

**Step 3: Write minimal implementation**

- start preload in an effect when tutor TTS becomes enabled
- expose:
  - progress percent
  - human-readable status message
  - selected backend
- keep first-click device-voice fallback while preload is in progress
- switch to Kokoro automatically once preload completes

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useTutorTts.ts src/hooks/useTutorTts.test.ts
git commit -m "feat(tutor): preload kokoro on tutor open"
```

### Task 4: Reflect Progress And Readiness In The Tutor UI

**Files:**
- Modify: `src/components/Results.tsx`
- Modify: `src/components/Results.test.tsx`
- Modify: `src/components/TutorPanel.tsx`
- Modify: `src/components/TutorPanel.test.tsx`
- Modify: `src/index.css`

**Step 1: Write the failing test**

```ts
it('shows download progress and ready state for torch voice', async () => {
  // inject mocked tts state, assert visible status copy
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/Results.test.tsx src/components/TutorPanel.test.tsx
```

Expected: FAIL because the panel does not yet render richer progress or readiness copy

**Step 3: Write minimal implementation**

- show progress text in the panel
- improve the read-aloud button label and status copy for:
  - preparing
  - downloading
  - ready
  - using device voice temporarily
- keep styling aligned with the existing tutor panel

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/Results.test.tsx src/components/TutorPanel.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Results.tsx src/components/Results.test.tsx src/components/TutorPanel.tsx src/components/TutorPanel.test.tsx src/index.css
git commit -m "feat(tutor): show torch voice progress"
```

### Task 5: Validate The End-To-End Browser Path

**Files:**
- Modify: `src/hooks/useTutorTts.test.ts`
- Modify: `src/lib/tutor/tts/workerBackedKokoroEngine.test.ts`
- Modify: `src/components/Results.test.tsx`

**Step 1: Write the failing regression test**

```ts
it('uses device speech on first click and kokoro after warmup finishes', async () => {
  // simulate progress -> ready -> second play, assert path changes
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts src/lib/tutor/tts/workerBackedKokoroEngine.test.ts src/components/Results.test.tsx
```

Expected: FAIL because at least one handoff between preload and playback is still incomplete

**Step 3: Write minimal implementation**

- fill any remaining worker/preload/playback gaps
- keep fallback behavior stable while tightening only what the tests require

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts src/lib/tutor/tts/workerBackedKokoroEngine.test.ts src/components/Results.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useTutorTts.test.ts src/lib/tutor/tts/workerBackedKokoroEngine.test.ts src/components/Results.test.tsx src/hooks/useTutorTts.ts src/lib/tutor/tts/workerBackedKokoroEngine.ts src/lib/tutor/tts/kokoroWorker.ts src/components/Results.tsx
git commit -m "test(tutor): cover torch voice preload flow"
```
