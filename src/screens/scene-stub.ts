import type { Ctx, Screen, ScreenId } from '../core/types';
import { createButton } from '../ui/components/button';
import { createYearFlip } from '../ui/components/yearflip';
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
      wrap.dataset.screen = 'flip';

      const prevDecay = ctx.store.getState().decay;
      ctx.store.setDecay(targetDecay);
      void tweenDecay(decayScope, prevDecay, targetDecay, 1200);

      const flip = createYearFlip(ctx.t(yearKey));
      const nextBtn = createButton({
        label: ctx.t('btn.next'),
        onClick: () => ctx.go(nextScreen),
      });

      wrap.append(flip.element, nextBtn);
      root.replaceChildren(wrap);
      return () => {};
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
