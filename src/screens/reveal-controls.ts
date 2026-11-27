import { isFacilitatorMode } from '../core/idle';
import type { Ctx } from '../core/types';
import { createButton } from '../ui/components/button';

export function createRevealControls(
  ctx: Ctx,
  onSkip: () => void,
): { element: HTMLElement; cleanup: () => void } {
  const wrap = document.createElement('div');
  wrap.className = 'rm-reveal-controls';

  const bar = document.createElement('div');
  bar.className = 'rm-reveal-progress';
  bar.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('div');
  fill.className = 'rm-reveal-progress-fill';
  bar.appendChild(fill);
  wrap.appendChild(bar);

  if (isFacilitatorMode(typeof window !== 'undefined' ? window.location.search : '')) {
    const skipBtn = createButton({
      label: ctx.t('btn.skip'),
      variant: 'secondary',
      onClick: onSkip,
    });
    skipBtn.classList.add('rm-facilitator-skip');
    wrap.appendChild(skipBtn);
  }

  const onKey = (ev: KeyboardEvent): void => {
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      onSkip();
    }
  };
  window.addEventListener('keydown', onKey);

  return {
    element: wrap,
    cleanup: () => window.removeEventListener('keydown', onKey),
  };
}
