# Torch Kokoro TTS Design

## Goal

Add a browser-side read-aloud feature to `Torch the Tutor` so students can hear Torch's latest explanation spoken in a high-quality voice without adding a server-side audio dependency.

## Product Decisions

- TTS is available only inside `Torch the Tutor`.
- The primary engine is browser-side `kokoro-js`.
- The default voice is `af_heart`.
- The first release uses one voice only and does not expose voice settings.
- Kokoro loads only after the student asks Torch to read something aloud.
- If Kokoro is unavailable or fails, Torch falls back to the browser's native speech engine.
- TTS ships behind a dedicated feature flag so it can be enabled independently from the text tutor.

## User Experience

Each open tutor session gets a single read-aloud control for Torch's latest visible assistant response. Before playback starts, the control reads `Read aloud`. While the voice model is loading, the UI shows `Loading voice...`. While audio is playing, the control changes to `Stop`.

The control should be disabled when there is no assistant message to read. Playback should stop immediately if the student:

- taps `Stop`
- sends a new chat message
- switches to a different problem
- closes the tutor panel
- resets the tutor session

If Kokoro fails to initialize or generate audio, the panel should quietly fall back to device speech for that attempt and show a small non-blocking status note. If device speech is also unavailable, the panel should show a short error message while leaving the text tutor fully usable.

## Architecture

The frontend owns the full TTS pipeline. A small engine layer wraps:

1. lazy-loading `kokoro-js`
2. creating and caching a shared Kokoro instance
3. generating audio for a text string
4. playing and cancelling audio
5. falling back to browser speech when Kokoro fails

The UI should not talk to `kokoro-js` directly. Instead, `TutorPanel` receives already-shaped state and callbacks from a new hook. That hook coordinates playback state, extracts the latest assistant message, sanitizes spoken text, and cancels active playback when the tutor session changes.

## Model Strategy

The default Kokoro configuration should prefer the best likely browser-side default from current upstream guidance:

- model: `onnx-community/Kokoro-82M-v1.0-ONNX`
- dtype: `q8`
- device: `wasm`
- voice: `af_heart`

This keeps the first-use download in the practical `~86 MB` range for the model asset instead of the much larger higher-precision options, while still preserving the voice quality that makes Kokoro worthwhile.

## State Model

The TTS hook should expose a small state machine:

- `idle`
- `loading`
- `ready`
- `speaking`
- `error`

Derived booleans for the panel should include:

- `canPlay`
- `isLoadingVoice`
- `isSpeaking`
- `isUsingFallbackVoice`

This keeps the panel mostly presentational and prevents audio lifecycle details from leaking into `Results` or `TutorPanel`.

## Spoken Text Rules

Torch responses are rendered as markdown, but spoken content should be plain language. Before generating audio, the engine should normalize the latest assistant message by:

- collapsing repeated whitespace
- stripping obvious markdown markers such as heading markers, bullets, and emphasis wrappers
- preserving the actual math wording and numbers

The first release does not need advanced SSML or custom pronunciation dictionaries. It only needs spoken text that sounds natural enough for short tutor responses.

## Components And Files

- `TutorPanel` gains a read-aloud control and TTS status copy.
- `Results` forwards TTS cleanup through the existing tutor lifecycle.
- `src/hooks/` gains a TTS controller hook for Torch.
- `src/lib/tutor/` gains TTS-specific helpers for feature flags, text normalization, and Kokoro engine access.
- `src/types/tutor.ts` may gain small state types if that improves clarity.

## Error Handling

Failure modes should stay local and non-fatal:

- Kokoro import/load failure: fall back to browser speech
- Kokoro generation failure: fall back to browser speech
- browser speech unsupported: surface a short inline error
- playback interruption from user action: treat as normal cancellation, not an error

No error path should break the existing text tutor, loading indicators, or message flow.

## Testing Strategy

Cover the feature in three layers:

- pure helper tests for spoken-text normalization and latest assistant message selection
- hook/service tests for Kokoro load, playback, cancellation, and fallback behavior
- `TutorPanel` interaction tests for button states and cleanup on close, reset, and problem switches

The tests should avoid downloading the real model. Mock the Kokoro loader and audio playback boundary so the suite stays fast and deterministic.

## Rollout

Add a new environment flag for Torch TTS and require the existing results-tutor flag as a prerequisite. This lets us:

- ship the code without immediately enabling it
- validate bundle behavior before exposing it broadly
- disable TTS quickly if browser compatibility issues appear

## Deferred Work

- voice selection
- preloading the model after idle time
- sentence-by-sentence streaming playback
- pronunciation tweaks for math symbols
- analytics around play rate and fallback rate
