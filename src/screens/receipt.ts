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

      const printLines: Array<{ label: string; points: number }> = [];
      for (const line of breakdown.lines) {
        const result = state.results.find((r) => r.sceneId === line.sceneId);
        const events =
          result && result.events.length > 0
            ? result.events
            : [{ sceneId: line.sceneId, lineKey: `regret.${line.sceneId}`, points: line.points }];
        events.forEach((ev, idx) => {
          printLines.push({
            label: ctx.t(ev.lineKey),
            points: idx === 0 ? line.points : 0,
          });
        });
      }

      const wrap = document.createElement('section');
      wrap.className = 'rm-receipt-wrap';
      wrap.dataset.screen = 'receipt';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('receipt.title');

      const tape = createTape(ctx.t('receipt.title'));
      const timers: number[] = [];

      if (prefersReducedMotion()) {
        for (const pl of printLines) {
          tape.addLine(pl);
        }
      } else {
        printLines.forEach((pl, idx) => {
          const id = window.setTimeout(() => {
            audio.tick();
            tape.addLine(pl);
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
        onClick: () => ctx.go('fairfight'),
      });

      const stageWin = document.createElement('div');
      stageWin.className = 'stage-window';
      stageWin.setAttribute('aria-hidden', 'true');

      wrap.append(heading, tape.element, scoreEl, small, cta, stageWin);
      root.replaceChildren(wrap);

      return () => {
        for (const id of timers) {
          window.clearTimeout(id);
        }
      };
    },
  };
}
