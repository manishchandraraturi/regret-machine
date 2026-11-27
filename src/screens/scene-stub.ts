import { isFacilitatorMode } from '../core/idle';
import type { Ctx, Screen, ScreenId } from '../core/types';
import { createButton } from '../ui/components/button';
import { tweenDecay } from '../ui/decay';

export function createFlipScreen(
  yearKey: string,
  nextScreen: ScreenId,
  targetDecay: number,
  decayScope: HTMLElement,
): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const wrap = document.createElement('section');
      wrap.className = 'rm-year-cinematic';
      wrap.dataset.screen = 'flip';

      const prevDecay = ctx.store.getState().decay;
      ctx.store.setDecay(targetDecay);
      void tweenDecay(decayScope, prevDecay, targetDecay, 1200);

      const stageWin = document.createElement('div');
      stageWin.className = 'stage-window';
      stageWin.setAttribute('aria-hidden', 'true');

      const slam = document.createElement('h1');
      slam.className = 'rm-year-slam';
      slam.textContent = ctx.t(yearKey);

      wrap.append(stageWin, slam);

      let done = false;
      const advance = (): void => {
        if (done) return;
        done = true;
        window.clearTimeout(timerId);
        window.removeEventListener('keydown', onKey);
        ctx.go(nextScreen);
      };

      if (isFacilitatorMode(typeof window !== 'undefined' ? window.location.search : '')) {
        const skipBtn = createButton({
          label: ctx.t('btn.skip'),
          variant: 'secondary',
          onClick: advance,
        });
        skipBtn.classList.add('rm-facilitator-skip');
        wrap.appendChild(skipBtn);
      }

      const onKey = (ev: KeyboardEvent): void => {
        if (ev.key === ' ' || ev.key === 'Enter') {
          ev.preventDefault();
          advance();
        }
      };
      window.addEventListener('keydown', onKey);
      const timerId = window.setTimeout(advance, 1600);

      root.replaceChildren(wrap);
      return () => {
        done = true;
        window.clearTimeout(timerId);
        window.removeEventListener('keydown', onKey);
      };
    },
  };
}

export function createStubScreen(label: string, onAdvance: (ctx: Ctx) => void): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const wrap = document.createElement('section');
      wrap.dataset.screen = 'stub';

      const h = document.createElement('h1');
      h.className = 'type-title';
      h.textContent = label;

      const btn = createButton({
        label: ctx.t('btn.skip'),
        onClick: () => onAdvance(ctx),
      });

      wrap.append(h, btn);
      root.replaceChildren(wrap);
      return () => {};
    },
  };
}
