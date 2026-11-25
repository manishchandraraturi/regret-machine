export function clampDecay(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function setDecay(target: HTMLElement, value: number): number {
  const clamped = clampDecay(value);
  const scratchOpacity = clamped >= 0.6 ? Math.min(1, (clamped - 0.5) * 1.2) : 0;
  const crackOpacity = clamped >= 0.9 ? 1 : 0;

  target.style.setProperty('--decay', clamped.toFixed(3));
  target.style.setProperty('--scratch-opacity', scratchOpacity.toFixed(3));
  target.style.setProperty('--crack-opacity', String(crackOpacity));
  target.dataset.decay = clamped.toFixed(2);
  target.dataset.curled = clamped >= 0.5 ? 'true' : 'false';
  target.dataset.scratched = clamped >= 0.6 ? 'true' : 'false';
  target.dataset.cracked = clamped >= 0.9 ? 'true' : 'false';

  const starbursts = target.querySelectorAll<HTMLElement>('.rm-starburst');
  for (const sb of starbursts) {
    sb.dataset.curled = clamped >= 0.5 ? 'true' : 'false';
  }
  return clamped;
}

export function tweenDecay(
  target: HTMLElement,
  from: number,
  to: number,
  durationMs = 1200,
): Promise<number> {
  const startVal = clampDecay(from);
  const endVal = clampDecay(to);

  if (prefersReducedMotion() || durationMs <= 0 || startVal === endVal) {
    return Promise.resolve(setDecay(target, endVal));
  }

  return new Promise((resolve) => {
    const startTime = performance.now();
    const step = (now: number): void => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDecay(target, current);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve(setDecay(target, endVal));
      }
    };
    requestAnimationFrame(step);
  });
}

export function createCrackOverlay(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 140 140');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('decay-crack');

  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M 140 0 L 106 32 L 114 48 L 80 78 L 86 96 L 46 132');
  svg.appendChild(path);
  return svg;
}
