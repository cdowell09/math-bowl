import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isResultsTutorEnabled, isTutorTtsEnabled } from './featureFlags';

describe('isResultsTutorEnabled', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('disables the tutor by default', () => {
    expect(isResultsTutorEnabled({})).toBe(false);
  });

  it('enables the tutor for common truthy values', () => {
    expect(isResultsTutorEnabled({ VITE_ENABLE_RESULTS_TUTOR: 'true' })).toBe(true);
    expect(isResultsTutorEnabled({ VITE_ENABLE_RESULTS_TUTOR: '1' })).toBe(true);
    expect(isResultsTutorEnabled({ VITE_ENABLE_RESULTS_TUTOR: 'yes' })).toBe(true);
  });
});

describe('isTutorTtsEnabled', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('disables tts by default', () => {
    expect(isTutorTtsEnabled({})).toBe(false);
  });

  it('requires both the results tutor and tts flags', () => {
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

    expect(
      isTutorTtsEnabled({
        VITE_ENABLE_RESULTS_TUTOR: 'false',
        VITE_ENABLE_TUTOR_TTS: 'true',
      })
    ).toBe(false);
  });
});
