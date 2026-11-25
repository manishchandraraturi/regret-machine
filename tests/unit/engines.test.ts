import jsQR from 'jsqr';
import { describe, expect, it, vi } from 'vitest';
import { createAudioEngine } from '../../src/engines/audio';
import { attachInput, normalizeKeyEvent } from '../../src/engines/input';
import { createLoop } from '../../src/engines/loop';
import { qrToRgbaBuffer, renderQrSvg } from '../../src/engines/qr';
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  drawShareCard,
} from '../../src/engines/sharecard';

describe('P3 shared engines', () => {
  it('audio engine never throws when AudioContext is unavailable', () => {
    const audio = createAudioEngine(false);
    expect(() => {
      audio.tick();
      audio.buzz();
      audio.chime();
      audio.register();
      audio.setMuted(true);
      audio.tick();
    }).not.toThrow();
  });

  it('loop engine computes deterministic dt with injectable clock', () => {
    let now = 1000;
    const rafQueue: Array<(ts: number) => void> = [];
    const loop = createLoop({
      now: () => now,
      requestFrame: (cb) => {
        rafQueue.push(cb);
        return rafQueue.length;
      },
      cancelFrame: () => {
        rafQueue.length = 0;
      },
    });

    const frames: Array<{ dt: number; t: number }> = [];
    loop.start((dt, t) => frames.push({ dt, t }));

    now = 1016;
    rafQueue.shift()?.(now);
    now = 1032;
    rafQueue.shift()?.(now);
    loop.stop();

    expect(frames).toEqual([
      { dt: 16, t: 16 },
      { dt: 16, t: 32 },
    ]);
  });

  it('input normalises keys 1-6, arrows, Space, and Enter', () => {
    expect(normalizeKeyEvent('1')).toEqual({ kind: 'select', index: 0, source: 'key' });
    expect(normalizeKeyEvent('6')).toEqual({ kind: 'select', index: 5, source: 'key' });
    expect(normalizeKeyEvent('ArrowRight')).toEqual({
      kind: 'move',
      direction: 'right',
      source: 'key',
    });
    expect(normalizeKeyEvent(' ')).toEqual({ kind: 'confirm', source: 'key' });
    expect(normalizeKeyEvent('Enter')).toEqual({ kind: 'confirm', source: 'key' });
    expect(normalizeKeyEvent('x')).toBeNull();

    const el = document.createElement('div');
    const seen: string[] = [];
    const detach = attachInput(el, (ev) => seen.push(ev.kind));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    detach();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(seen).toEqual(['select']);
  });

  it('sharecard draws 1080x1920 canvas', () => {
    const canvas = document.createElement('canvas');
    const fakeCtx = {
      fillStyle: '',
      font: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(canvas, 'getContext').mockReturnValue(fakeCtx);

    const out = drawShareCard(canvas, {
      cardName: 'The Topper',
      regretScore: 84,
      regretLabel: 'Painful',
      tierLine: 'Core Ultra 5 or 7 class laptop',
      footerLine: 'A student project made for the CMRIT x Intel 1 Million Minds challenge.',
    });

    expect(out.width).toBe(SHARE_CARD_WIDTH);
    expect(out.height).toBe(SHARE_CARD_HEIGHT);
  });

  it('QR encodes a URL and jsQR decodes it back identically', () => {
    const targetUrl = 'https://www.intel.com/content/www/us/en/products/docs/processors/core-ultra/ai-pc.html';
    const svg = renderQrSvg(targetUrl);
    expect(svg.tagName.toLowerCase()).toBe('svg');

    const img = qrToRgbaBuffer(targetUrl, 6);
    const decoded = jsQR(img.data, img.width, img.height);
    expect(decoded?.data).toBe(targetUrl);
  });
});
