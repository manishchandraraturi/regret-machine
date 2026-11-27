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
      wrap.className = 'rm-receipt-wrap rm-receipt-u5';
      wrap.dataset.screen = 'receipt';

      const leftCol = document.createElement('div');
      leftCol.className = 'rm-receipt-left';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('receipt.title');

      const scoreNum = document.createElement('p');
      scoreNum.className = 'rm-receipt-big-score';
      scoreNum.textContent = `${prefersReducedMotion() ? breakdown.regret : 0} / 100`;

      const meter = document.createElement('div');
      meter.className = 'rm-receipt-meter';
      const meterFill = document.createElement('div');
      meterFill.className = 'rm-receipt-meter-fill';
      meterFill.style.setProperty('transform', `scaleX(${(breakdown.regret / 100).toFixed(2)})`);
      meter.appendChild(meterFill);

      const labelEl = document.createElement('p');
      labelEl.className = 'type-title rm-receipt-label';
      labelEl.textContent = ctx.t(breakdown.labelKey);

      const small = document.createElement('p');
      small.className = 'type-small';
      small.textContent = ctx.t('receipt.small');

      const cta = createButton({
        label: ctx.t('receipt.cta'),
        onClick: () => ctx.go('fairfight'),
      });

      leftCol.append(heading, scoreNum, meter, labelEl, small, cta);

      const tape = createTape(ctx.t('receipt.title'));
      const timers: number[] = [];
      let rafId = 0;

      if (prefersReducedMotion()) {
        for (const pl of printLines) tape.addLine(pl);
      } else {
        const start = performance.now();
        const countStep = (now: number): void => {
          const p = Math.min(1, (now - start) / 900);
          scoreNum.textContent = `${Math.round(breakdown.regret * p)} / 100`;
          if (p < 1) rafId = window.requestAnimationFrame(countStep);
        };
        rafId = window.requestAnimationFrame(countStep);

        printLines.forEach((pl, idx) => {
          timers.push(
            window.setTimeout(() => {
              audio.tick();
              tape.addLine(pl);
            }, idx * 350),
          );
        });
      }

      const stageWin = document.createElement('div');
      stageWin.className = 'stage-window';
      stageWin.setAttribute('aria-hidden', 'true');

      wrap.append(leftCol, tape.element, stageWin);
      root.replaceChildren(wrap);

      return () => {
        window.cancelAnimationFrame(rafId);
        for (const id of timers) window.clearTimeout(id);
      };
    },
  };
}
