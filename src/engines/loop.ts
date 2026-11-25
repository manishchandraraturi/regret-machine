import type { Loop } from '../core/types';

export interface LoopClock {
  now(): number;
  requestFrame(cb: (ts: number) => void): number;
  cancelFrame(id: number): void;
}

export interface ControlledLoop extends Loop {
  pause(): void;
  resume(): void;
}

const defaultClock: LoopClock = {
  now: () => performance.now(),
  requestFrame: (cb) => window.requestAnimationFrame(cb),
  cancelFrame: (id) => window.cancelAnimationFrame(id),
};

export function createLoop(clock: LoopClock = defaultClock): ControlledLoop {
  let running = false;
  let paused = false;
  let rafId: number | null = null;
  let lastTs = 0;
  let startTs = 0;
  let callback: ((dtMs: number, tMs: number) => void) | null = null;

  const tick = (ts: number): void => {
    if (!running || paused || !callback) return;
    const dt = Math.max(0, ts - lastTs);
    lastTs = ts;
    callback(dt, ts - startTs);
    if (running && !paused) {
      rafId = clock.requestFrame(tick);
    }
  };

  return {
    start(cb: (dtMs: number, tMs: number) => void): void {
      callback = cb;
      running = true;
      paused = false;
      startTs = clock.now();
      lastTs = startTs;
      rafId = clock.requestFrame(tick);
    },
    pause(): void {
      paused = true;
      if (rafId !== null) {
        clock.cancelFrame(rafId);
        rafId = null;
      }
    },
    resume(): void {
      if (!running || !paused) return;
      paused = false;
      lastTs = clock.now();
      rafId = clock.requestFrame(tick);
    },
    stop(): void {
      running = false;
      paused = false;
      callback = null;
      if (rafId !== null) {
        clock.cancelFrame(rafId);
        rafId = null;
      }
    },
  };
}
