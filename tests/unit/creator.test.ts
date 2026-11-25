import { describe, expect, it } from 'vitest';
import { scoreCreator } from '../../src/core/scoring';
import { stepCreatorFill } from '../../src/screens/scene-creator';

describe('P9 creator night scene scoring & fill', () => {
  it('fills at 1.0/s before 8s, slows to 0.6/s after 8s, drains at 0.5/s released, clamps [0, 100]', () => {
    const afterHold = stepCreatorFill(0, true, 2000, 1000);
    expect(afterHold).toBeCloseTo(10, 5);

    const afterSlowHold = stepCreatorFill(50, true, 9000, 1000);
    expect(afterSlowHold).toBeCloseTo(56, 5);

    const afterDrain = stepCreatorFill(20, false, 3000, 1000);
    expect(afterDrain).toBeCloseTo(15, 5);

    expect(stepCreatorFill(95, true, 1000, 2000)).toBe(100);
    expect(stepCreatorFill(2, false, 1000, 2000)).toBe(0);
    expect(scoreCreator(120)).toBe(100);
  });
});
