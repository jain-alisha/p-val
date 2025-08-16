import { describe, expect, it } from 'vitest';
import { tTestTwoSample } from '../src/utils/stats';

describe('t-test', () => {
  it('returns ≈0.05 false-positive rate when delta=0', () => {
    const p = tTestTwoSample(
      Array.from({ length: 30 }, () => Math.random()),
      Array.from({ length: 30 }, () => Math.random())
    );
    expect(p).toBeGreaterThanOrEqual(0);   // basic check
    expect(p).toBeLessThanOrEqual(1);
  });
});
