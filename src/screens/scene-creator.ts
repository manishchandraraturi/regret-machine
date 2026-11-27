import { getScenesConfig } from '../core/data';
import { scoreCreator } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { createLoop } from '../engines/loop';
import { createButton } from '../ui/components/button';
import { createClaimChip } from '../ui/components/claimchip';
import { createSplitReveal } from '../ui/components/splitreveal';
import { createRevealControls } from './reveal-controls';
import type { SceneFactory } from './scenes';

export function stepCreatorFill(
  fillPct: number,
  held: boolean,
  tMs: number,
  dtMs: number,
): number {
  const sec = Math.max(0, dtMs) / 1000;
  let ratePerSec = -0.5;
  if (held) {
    ratePerSec = tMs >= 8000 ? 0.6 : 1.0;
  }
  const next = fillPct + ratePerSec * sec * 10;
  return Math.max(0, Math.min(100, next));
}

export function createCreatorScene(audio?: Audio): SceneFactory {
  return {
    mount(playArea: HTMLElement, ctx: Ctx, onDone: (result: SceneResult) => void): () => void {
      const meta = getScenesConfig().scenes.creator;
      const playMs = meta.playMs;
      const totalMs = meta.durationMs;

      let fillPct = 0;
      let held = false;
      let stuttered = false;
      let phase: 'PLAY' | 'FAIL' | 'REVEAL' = 'PLAY';
      let finished = false;
      let cleanupReveal: (() => void) | null = null;

      const wrap = document.createElement('div');
      wrap.className = 'rm-scene-play';
      wrap.dataset.phase = 'PLAY';

      const hud = document.createElement('div');
      hud.className = 'rm-scene-hud';

      const pctEl = document.createElement('span');
      pctEl.className = 'type-body';
      pctEl.dataset.testid = 'creator-fill';
      pctEl.textContent = '0%';
      hud.appendChild(pctEl);

      const bar = document.createElement('div');
      bar.className = 'rm-battery-bar';
      const fill = document.createElement('div');
      fill.className = 'rm-battery-fill';
      fill.style.setProperty('width', '0%');
      bar.appendChild(fill);

      const stutterSlot = document.createElement('div');
      const holdBtn = createButton({
        label: ctx.t('scene.creator.hint'),
        onClick: () => {},
      });
      holdBtn.dataset.testid = 'creator-hold-btn';

      const setHeld = (val: boolean): void => {
        held = val;
      };
      holdBtn.addEventListener('pointerdown', () => setHeld(true));
      holdBtn.addEventListener('pointerup', () => setHeld(false));
      holdBtn.addEventListener('pointerleave', () => setHeld(false));

      const onKeyDown = (ev: KeyboardEvent): void => {
        if (ev.key === ' ' || ev.key === 'Enter') setHeld(true);
      };
      const onKeyUp = (ev: KeyboardEvent): void => {
        if (ev.key === ' ' || ev.key === 'Enter') setHeld(false);
      };
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      const revealHost = document.createElement('div');
      wrap.append(hud, bar, stutterSlot, holdBtn, revealHost);
      playArea.replaceChildren(wrap);

      const completeScene = (): void => {
        if (finished) return;
        finished = true;
        cleanupReveal?.();
        loop.stop();
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        onDone({
          sceneId: 'creator',
          playerScore: scoreCreator(fillPct),
          events: [{ sceneId: 'creator', lineKey: 'regret.creator', points: 0 }],
        });
      };

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'FAIL';
        wrap.dataset.phase = 'FAIL';
        audio?.buzz();
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const state = ctx.store.getState();
        const c03 = ctx.claim('C-03');
        const split = createSplitReveal({
          decay: state.decay,
          leftTitle: ctx.t('reveal.left'),
          leftBody: ctx.t('scene.creator.fail'),
          rightTitle: ctx.t('reveal.right'),
          rightBody: ctx.t('scene.creator.win'),
          claimText: `${c03.text[state.lang]} (${ctx.t(`tag.${c03.tag}`)})`,
        });

        const baselineEl = document.createElement('p');
        baselineEl.className = 'type-small';
        baselineEl.dataset.testid = 'creator-baseline';
        baselineEl.textContent = ctx.t('scene.creator.baseline');

        const claimsRow = document.createElement('div');
        claimsRow.className = 'rm-claims-row';
        const seenClaims = new Set<string>();
        for (const cid of ['C-03', 'C-04']) {
          if (seenClaims.has(cid)) continue;
          seenClaims.add(cid);
          const c = ctx.claim(cid);
          claimsRow.appendChild(
            createClaimChip({
              claim: c,
              tagLabel: ctx.t(`tag.${c.tag}`),
              closeLabel: ctx.t('btn.close'),
            }),
          );
        }

        const revealCtrl = createRevealControls(ctx, completeScene);
        cleanupReveal = revealCtrl.cleanup;

        stutterSlot.replaceChildren();
        holdBtn.remove();
        revealHost.replaceChildren(split, baselineEl, claimsRow, revealCtrl.element);
      };

      const loop = createLoop();
      loop.start((dtMs, tMs) => {
        if (phase === 'PLAY') {
          fillPct = stepCreatorFill(fillPct, held, tMs, dtMs);
          const rounded = Math.round(fillPct);
          pctEl.textContent = `${rounded}%`;
          fill.style.setProperty('width', `${rounded}%`);

          if (tMs >= 8000 && !stuttered) {
            stuttered = true;
            audio?.buzz();
            ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
            const msg = document.createElement('p');
            msg.className = 'rm-wifi-banner type-body';
            msg.dataset.testid = 'creator-stutter';
            msg.textContent = ctx.t('scene.creator.fail');
            stutterSlot.replaceChildren(msg);
          }

          if (tMs >= playMs) {
            enterReveal();
          }
        } else if (tMs >= totalMs) {
          completeScene();
        }
      });

      return () => {
        cleanupReveal?.();
        loop.stop();
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    },
  };
}
