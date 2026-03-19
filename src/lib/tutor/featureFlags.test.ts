import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isResultsTutorEnabled } from './featureFlags';

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
