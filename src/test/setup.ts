import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.stubEnv('VITE_ENABLE_RESULTS_TUTOR', 'true');
});

afterEach(() => {
  vi.unstubAllEnvs();
});
