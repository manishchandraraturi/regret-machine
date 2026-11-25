export interface IdleController {
  start(): void;
  touch(): void;
  stop(): void;
}

export function createIdleController(idleSeconds: number, onIdle: () => void): IdleController {
  const delayMs = Math.max(1, idleSeconds) * 1000;
  let timerId: number | null = null;
  let active = false;

  const schedule = (): void => {
    if (timerId !== null) {
      window.clearTimeout(timerId);
    }
    if (!active) return;
    timerId = window.setTimeout(() => {
      onIdle();
      schedule();
    }, delayMs);
  };

  const onActivity = (): void => {
    if (active) schedule();
  };

  const events = ['pointerdown', 'keydown', 'touchstart'] as const;

  return {
    start(): void {
      if (active) return;
      active = true;
      for (const ev of events) {
        window.addEventListener(ev, onActivity, { passive: true });
      }
      schedule();
    },
    touch(): void {
      schedule();
    },
    stop(): void {
      active = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
      for (const ev of events) {
        window.removeEventListener(ev, onActivity);
      }
    },
  };
}

export function isFacilitatorMode(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('facilitator') === '1';
}
