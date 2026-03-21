# Torch Kokoro TTS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add browser-side Kokoro read-aloud controls to Torch the Tutor, with lazy loading, cancellation, and browser speech fallback.

**Architecture:** The React client will lazily import `kokoro-js` the first time a student asks Torch to read the latest assistant message aloud. A dedicated TTS engine/controller layer will normalize spoken text, manage Kokoro/browser-speech playback state, and expose a small control surface that `TutorPanel` can render without owning audio lifecycle details.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Testing Library, `kokoro-js`

---

### Task 1: Add TTS Dependency And Feature Flags

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/lib/tutor/featureFlags.ts`
- Modify: `src/lib/tutor/featureFlags.test.ts`

**Step 1: Write the failing test**

Extend the tutor feature-flag tests to require a dedicated Torch TTS flag:

```ts
it('enables tutor tts only when both tutor and tts flags are on', () => {
  expect(
    isTutorTtsEnabled({
      VITE_ENABLE_RESULTS_TUTOR: 'true',
      VITE_ENABLE_TUTOR_TTS: 'true',
    })
  ).toBe(true);

  expect(
    isTutorTtsEnabled({
      VITE_ENABLE_RESULTS_TUTOR: 'true',
      VITE_ENABLE_TUTOR_TTS: 'false',
    })
  ).toBe(false);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/tutor/featureFlags.test.ts
```

Expected: FAIL because `isTutorTtsEnabled` and the new flag behavior do not exist yet

**Step 3: Write minimal implementation**

- Add `kokoro-js` to dependencies
- Add `isTutorTtsEnabled(env?)`
- Make TTS require both the results-tutor flag and `VITE_ENABLE_TUTOR_TTS`

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/tutor/featureFlags.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/tutor/featureFlags.ts src/lib/tutor/featureFlags.test.ts
git commit -m "feat(tutor): add torch tts feature flag"
```

### Task 2: Build The Kokoro Engine And Spoken Text Helpers

**Files:**
- Create: `src/lib/tutor/tts/sanitizeTutorSpeech.ts`
- Create: `src/lib/tutor/tts/sanitizeTutorSpeech.test.ts`
- Create: `src/lib/tutor/tts/kokoroEngine.ts`
- Create: `src/lib/tutor/tts/kokoroEngine.test.ts`

**Step 1: Write the failing tests**

Add helper coverage:

```ts
it('removes basic markdown formatting before speech', () => {
  expect(sanitizeTutorSpeech('## Try this\n\n- Count by **5**')).toBe('Try this Count by 5');
});
```

Add engine coverage:

```ts
it('loads Kokoro lazily and generates audio with af_heart', async () => {
  const loader = vi.fn().mockResolvedValue(mockEngine);
  const engine = createKokoroEngine({ loadKokoro: loader });

  await engine.speak('Count by 5');

  expect(loader).toHaveBeenCalledTimes(1);
  expect(mockGenerate).toHaveBeenCalledWith('Count by 5', expect.objectContaining({ voice: 'af_heart' }));
});
```

**Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/tutor/tts/sanitizeTutorSpeech.test.ts src/lib/tutor/tts/kokoroEngine.test.ts
```

Expected: FAIL because the helper and engine modules do not exist yet

**Step 3: Write minimal implementation**

- Create a speech sanitizer that strips obvious markdown noise and collapses whitespace
- Create a Kokoro engine wrapper that:
  - lazy-loads `kokoro-js`
  - uses `onnx-community/Kokoro-82M-v1.0-ONNX`
  - requests `dtype: 'q8'`, `device: 'wasm'`, `voice: 'af_heart'`
  - caches the model instance
  - exposes `speak()` and `stop()` methods
- Keep playback behind injectable boundaries so tests can mock audio without the real model

**Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/lib/tutor/tts/sanitizeTutorSpeech.test.ts src/lib/tutor/tts/kokoroEngine.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/tutor/tts/sanitizeTutorSpeech.ts src/lib/tutor/tts/sanitizeTutorSpeech.test.ts src/lib/tutor/tts/kokoroEngine.ts src/lib/tutor/tts/kokoroEngine.test.ts
git commit -m "feat(tutor): add kokoro tts engine"
```

### Task 3: Add The Torch TTS Controller Hook

**Files:**
- Create: `src/hooks/useTutorTts.ts`
- Create: `src/hooks/useTutorTts.test.ts`
- Modify: `src/types/tutor.ts`

**Step 1: Write the failing test**

```ts
it('plays the latest assistant message and falls back when kokoro fails', async () => {
  const kokoroSpeak = vi.fn().mockRejectedValue(new Error('load failed'));
  const fallbackSpeak = vi.fn().mockResolvedValue(undefined);

  const { result } = renderHook(() =>
    useTutorTts({
      messages: [
        { role: 'assistant', content: 'First answer' },
        { role: 'assistant', content: 'Latest answer' },
      ],
      enabled: true,
      engine: { speak: kokoroSpeak, stop: vi.fn() },
      fallbackVoice: { speak: fallbackSpeak, stop: vi.fn(), supported: true },
    })
  );

  await act(async () => {
    await result.current.playLatestAssistantMessage();
  });

  expect(kokoroSpeak).toHaveBeenCalledWith('Latest answer');
  expect(fallbackSpeak).toHaveBeenCalledWith('Latest answer');
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts
```

Expected: FAIL because the hook does not exist yet

**Step 3: Write minimal implementation**

Create a hook that:

- derives the latest assistant message
- sanitizes speech text
- exposes `playLatestAssistantMessage()` and `stopPlayback()`
- tracks `idle`, `loading`, `speaking`, `error`
- falls back to browser speech if Kokoro fails
- stops playback on unmount and when its dependencies change

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/hooks/useTutorTts.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useTutorTts.ts src/hooks/useTutorTts.test.ts src/types/tutor.ts
git commit -m "feat(tutor): add torch tts controller hook"
```

### Task 4: Integrate Read-Aloud Controls Into TutorPanel

**Files:**
- Modify: `src/components/TutorPanel.tsx`
- Modify: `src/components/TutorPanel.test.tsx`
- Modify: `src/components/Results.tsx`

**Step 1: Write the failing test**

Add a panel interaction test:

```ts
it('shows a read aloud button and stops playback when closing the panel', async () => {
  const stopPlayback = vi.fn();

  render(
    <TutorPanel
      {...makeProps()}
      canPlayLatestAssistantMessage
      onPlayLatestAssistantMessage={vi.fn()}
      onStopPlayback={stopPlayback}
      ttsStatus="speaking"
    />
  );

  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(stopPlayback).toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/TutorPanel.test.tsx src/components/Results.test.tsx
```

Expected: FAIL because the panel and results flow do not expose the new TTS controls yet

**Step 3: Write minimal implementation**

- Add read-aloud UI to `TutorPanel`
- Show `Read aloud`, `Loading voice...`, or `Stop` based on TTS state
- Pass TTS props from `Results`
- Stop playback when closing or resetting the tutor

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/TutorPanel.test.tsx src/components/Results.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/TutorPanel.tsx src/components/TutorPanel.test.tsx src/components/Results.tsx
git commit -m "feat(tutor): add torch read aloud controls"
```

### Task 5: Verify End-To-End Behavior

**Files:**
- Modify: `src/components/Results.test.tsx`
- Modify: `src/hooks/useTutorTts.test.ts`
- Modify: `src/components/TutorPanel.test.tsx`

**Step 1: Write the failing regression test**

Add a regression test that proves playback stops when the active tutor problem changes:

```ts
it('stops playback when the active problem changes', async () => {
  const stop = vi.fn();
  // render, change problem, assert stop called
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/components/Results.test.tsx src/hooks/useTutorTts.test.ts src/components/TutorPanel.test.tsx
```

Expected: FAIL because at least one cleanup path is still missing

**Step 3: Write minimal implementation**

- Fill any cleanup gaps found by the regression
- Tighten UI copy and state transitions only as needed to satisfy the tests

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/components/Results.test.tsx src/hooks/useTutorTts.test.ts src/components/TutorPanel.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Results.test.tsx src/hooks/useTutorTts.test.ts src/components/TutorPanel.test.tsx src/hooks/useTutorTts.ts src/components/TutorPanel.tsx src/components/Results.tsx
git commit -m "test(tutor): cover torch tts cleanup"
```
