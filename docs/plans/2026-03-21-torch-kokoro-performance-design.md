# Torch Kokoro Performance Design

## Goal

Reduce Torch's first-run Kokoro latency enough that browser-side TTS feels fast enough to evaluate fairly before deciding whether to move to server-side generation.

## Product Decisions

- Torch should begin preparing Kokoro as soon as the tutor opens, not after the first `Read aloud` click.
- The UI should show explicit progress instead of a generic loading state.
- Browser-side Kokoro remains the preferred voice engine.
- Device speech remains the immediate fallback when Kokoro is still warming or fails.
- Torch should automatically try `webgpu` first on supported browsers, then fall back to `wasm`.
- If this pass still feels too slow in practice, the next step is server-side audio generation rather than more browser complexity.

## User Experience

When the tutor panel opens, Torch should quietly start preparing the Kokoro voice engine. The panel should show lightweight status such as:

- `Preparing Torch voice...`
- `Downloading Torch voice... 42%`
- `Torch voice ready`
- `Using device voice while Torch warms up`

On the first `Read aloud` click, if Kokoro is not ready yet, Torch should speak immediately with the device voice and continue warming Kokoro in the background. Once warmup completes, later plays should use Kokoro automatically.

If WebGPU is available and initializes successfully, Torch should use it without asking the user. If WebGPU fails, Torch should fall back to the `wasm` path without breaking the panel.

## Architecture

The current `useTutorTts` hook should stop owning model initialization directly on the main thread. Instead:

1. `useTutorTts` becomes a controller and state aggregator
2. a dedicated worker-backed Kokoro runtime owns preload and generation
3. the worker reports progress events back to the main thread
4. the controller exposes a simple UI state surface to `Results` and `TutorPanel`

The worker should:

- attempt `webgpu` first when supported
- fall back to `wasm` automatically
- report progress and readiness
- generate audio blobs or transferable binary payloads for playback

## Device Strategy

### Preferred Path

- `device: 'webgpu'` when the browser supports it and the runtime initializes cleanly

### Fallback Path

- `device: 'wasm'` with the existing quantized model

### Last Resort

- browser `speechSynthesis`

The runtime should remember the successful backend for the session so later requests do not repeat failed initialization probes.

## Progress Model

The TTS layer should expose more specific states than the current `idle/loading/speaking/error` model. The UI needs to distinguish:

- not started
- preparing
- downloading model assets
- ready
- speaking with Kokoro
- speaking with device voice
- error

The worker should translate raw `progress_callback` events into UI-friendly messages with percent values when available.

## Worker Strategy

The worker should be created lazily when Torch first opens, not on initial page load. This keeps the base app light while moving model work off the main thread once tutoring is actually used.

The main thread should send worker commands such as:

- `preload`
- `speak`
- `stop`

The worker should emit events such as:

- `progress`
- `ready`
- `audio`
- `error`
- `backend-selected`

## Error Handling

If `webgpu` fails, the runtime should retry with `wasm` before surfacing any visible error.

If both Kokoro backends fail, Torch should:

- keep the panel interactive
- continue to offer device voice
- show a short status note that Torch voice could not be prepared

No error path should block the text tutor or freeze the UI.

## Testing Strategy

Add tests for:

- preload beginning when the tutor opens
- progress updates reaching the UI
- backend selection logic (`webgpu` then `wasm`)
- worker-driven ready state
- immediate device-speech fallback while warmup is in progress
- later Kokoro playback after warmup succeeds

The worker protocol should be tested with mocked postMessage boundaries instead of the real model.

## Success Criteria

This pass is successful if:

- the UI stays responsive during warmup
- the user gets immediate audio on first click
- the app clearly communicates whether Torch voice is preparing or ready
- repeat plays reliably use Kokoro once warmup completes

If those conditions are met but first-time readiness still feels too slow, we should stop optimizing the browser path and move to server-side generation.
