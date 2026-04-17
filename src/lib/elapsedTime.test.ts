import { describe, expect, it } from 'vitest';
import { getElapsedTimeAnswerMinutes } from './elapsedTime';

describe('getElapsedTimeAnswerMinutes', () => {
  it('accepts total minutes in minutes mode', () => {
    expect(getElapsedTimeAnswerMinutes('minutes', { minutes: '80' })).toBe(80);
  });

  it('adds hours and minutes in hours-and-minutes mode', () => {
    expect(getElapsedTimeAnswerMinutes('hours-minutes', { hours: '1', minutes: '20' })).toBe(80);
  });

  it('treats a blank hours field as zero', () => {
    expect(getElapsedTimeAnswerMinutes('hours-minutes', { hours: '', minutes: '20' })).toBe(20);
  });

  it('returns null when the fields are empty', () => {
    expect(getElapsedTimeAnswerMinutes('hours-minutes', { hours: '', minutes: '' })).toBeNull();
  });
});
