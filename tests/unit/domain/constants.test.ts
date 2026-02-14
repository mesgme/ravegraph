import { describe, it, expect } from 'vitest';
import {
  TREND_THRESHOLD,
  DEFAULT_DAYS_BACK,
  SCORE_MIN,
  SCORE_MAX,
} from '../../../src/domain/constants.js';

describe('domain constants', () => {
  it('TREND_THRESHOLD is a positive number', () => {
    expect(TREND_THRESHOLD).toBeGreaterThan(0);
    expect(TREND_THRESHOLD).toBe(1);
  });

  it('DEFAULT_DAYS_BACK is 30', () => {
    expect(DEFAULT_DAYS_BACK).toBe(30);
  });

  it('score bounds are 0 to 100', () => {
    expect(SCORE_MIN).toBe(0);
    expect(SCORE_MAX).toBe(100);
  });
});
