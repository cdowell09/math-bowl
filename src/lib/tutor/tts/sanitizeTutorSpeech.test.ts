import { describe, expect, it } from 'vitest';
import { sanitizeTutorSpeech } from './sanitizeTutorSpeech';

describe('sanitizeTutorSpeech', () => {
  it('strips markdown noise and collapses whitespace', () => {
    expect(
      sanitizeTutorSpeech('## Try this\n\n- Count by **5** and read [the hint](https://example.com).')
    ).toBe('Try this Count by 5 and read the hint.');
  });

  it('keeps plain math words readable after removing inline code markers', () => {
    expect(sanitizeTutorSpeech('Use `skip-counting` to finish the pattern.')).toBe(
      'Use skip-counting to finish the pattern.'
    );
  });
});
