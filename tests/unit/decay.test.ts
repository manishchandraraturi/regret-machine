import { describe, expect, it, vi } from 'vitest';
import { clampDecay, setDecay, tweenDecay } from '../../src/ui/decay';

describe('decay engine', () => {
  it('clamps values to [0, 1] and handles NaN', () => {
    expect(clampDecay(-0.5)).toBe(0);
    expect(clampDecay(0)).toBe(0);
    expect(clampDecay(0.5)).toBe(0.5);
    expect(clampDecay(1.4)).toBe(1);
    expect(clampDecay(Number.NaN)).toBe(0);
  });

  it('sets CSS variables and state attributes at thresholds', () => {
    const el = document.createElement('div');
    setDecay(el, 0.25);
    expect(el.style.getPropertyValue('--decay')).toBe('0.250');
    expect(el.dataset.curled).toBe('false');
    expect(el.dataset.scratched).toBe('false');
    expect(el.dataset.cracked).toBe('false');

    setDecay(el, 0.65);
    expect(el.dataset.curled).toBe('true');
    expect(el.dataset.scratched).toBe('true');
    expect(el.dataset.cracked).toBe('false');

    setDecay(el, 0.95);
    expect(el.dataset.cracked).toBe('true');
  });

  it('jumps immediately on tweenDecay when prefers-reduced-motion is true', async () => {
    const el = document.createElement('div');
    const origMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;

    const result = await tweenDecay(el, 0, 0.75, 1200);
    expect(result).toBe(0.75);
    expect(el.style.getPropertyValue('--decay')).toBe('0.750');

    window.matchMedia = origMatchMedia;
  });
});
