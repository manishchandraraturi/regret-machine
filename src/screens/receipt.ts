import { getScenesConfig } from '../core/data';
import { computeRegret } from '../core/scoring';
import type { Audio, Ctx, Screen } from '../core/types';
import { createButton } from '../ui/components/button';
import { createTape } from '../ui/components/tape';
import { prefersReducedMotion } from '../ui/decay';

export function createReceiptScreen(audio: Audio): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const state = ctx.store.getState();
      const persona = state.persona ?? 'study';
      const breakdown = computeRegret(persona, state.results, getScenesConfig());

      const wrap = document.createElement('section');
      wrap.className = 'rm-receipt-wrap';
      wrap.dataset.screen = 'receipt';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('receipt.title');

      const tape = createTape(ctx.t('receipt.title'));
      const timers: number[] = [];

      if (prefersReducedMotion()) {
        for (const line of breakdown.lines) {
          tape.addLine({ label: ctx.t(`regret.${line.sceneId}`), points: line.points });
        }
      } else {
        breakdown.lines.forEach((line, idx) => {
          const id = window.setTimeout(() => {
            audio.tick();
            tape.addLine({ label: ctx.t(`regret.${line.sceneId}`), points: line.points });
          }, idx * 350);
          timers.push(id);
        });
      }

      const scoreEl = document.createElement('p');
      scoreEl.className = 'type-title';
      scoreEl.textContent = `${ctx.t('receipt.total')}: ${breakdown.regret} / 100 — ${ctx.t(
        breakdown.labelKey,
      )}`;

      const small = document.createElement('p');
      small.className = 'type-small';
      small.textContent = ctx.t('receipt.small');

      const cta = createButton({
        label: ctx.t('receipt.cta'),
        onClick: () => ctx.go('result'),
      });

      wrap.append(heading, tape.element, scoreEl, small, cta);
      root.replaceChildren(wrap);

      return () => {
        for (const id of timers) {
          window.clearTimeout(id);
        }
      };
    },
  };
}
