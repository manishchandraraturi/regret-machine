import { describe, expect, it } from 'vitest';
import { getFallbackReason, isLiteRequested } from '../../src/stage3d/fallback';
import { createAdaptiveQuality } from '../../src/stage3d/quality';

describe('R2 Stage3D fallback decision & adaptive quality', () => {
  it('falls back to DOM on ?lite=1, prefers-reduced-motion, or missing WebGL2', () => {
    expect(isLiteRequested('?lite=1')).toBe(true);
    expect(isLiteRequested('?lang=hi&lite=1')).toBe(true);
    expect(isLiteRequested('?lang=hi')).toBe(false);

    expect(
      getFallbackReason({ search: '?lite=1', reducedMotion: false, hasWebGL2: true }),
    ).toBe('lite');
    expect(
      getFallbackReason({ search: '', reducedMotion: true, hasWebGL2: true }),
    ).toBe('reduced-motion');
    expect(
      getFallbackReason({ search: '', reducedMotion: false, hasWebGL2: false }),
    ).toBe('no-webgl2');
    expect(
      getFallbackReason({ search: '', reducedMotion: false, hasWebGL2: true }),
    ).toBeNull();
  });

  it('adaptive quality keeps high DPR at 16ms and downgrades above 24ms after 60 frames', () => {
    const fast = createAdaptiveQuality(2, 60, 24);
    for (let i = 0; i < 60; i += 1) {
      fast.recordFrame(16.5);
    }
    expect(fast.getState().degraded).toBe(false);
    expect(fast.getState().pixelRatio).toBe(2);
    expect(fast.getState().particleScale).toBe(1);
    expect(fast.getState().postEffects).toBe(true);

    const slow = createAdaptiveQuality(2, 60, 24);
    for (let i = 0; i < 60; i += 1) {
      slow.recordFrame(32);
    }
    expect(slow.getState().degraded).toBe(true);
    expect(slow.getState().pixelRatio).toBe(1);
    expect(slow.getState().particleScale).toBe(0.5);
    expect(slow.getState().postEffects).toBe(false);
  });
});
