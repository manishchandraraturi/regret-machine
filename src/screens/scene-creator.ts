import { getScenesConfig } from '../core/data';
import { scoreCreator } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { createLoop } from '../engines/loop';
import { createRevealView } from './reveal-view';
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

      const center = document.createElement('div');
      center.className = 'rm-export-wrap';

      const holdBtn = document.createElement('button');
      holdBtn.type = 'button';
      holdBtn.className = 'rm-export-btn';
      holdBtn.dataset.testid = 'creator-hold-btn';

      const pctEl = document.createElement('span');
      pctEl.className = 'rm-export-pct';
      pctEl.dataset.testid = 'creator-fill';
      pctEl.textContent = '0%';

      const labelEl = document.createElement('span');
      labelEl.className = 'rm-export-label';
      labelEl.textContent = ctx.t('scene.creator.export');

      holdBtn.append(pctEl, labelEl);
      center.appendChild(holdBtn);

      const setHeld = (val: boolean): void => {
        held = val;
        holdBtn.classList.toggle('rm-export-btn--held', val);
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
      wrap.append(center, revealHost);
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
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        audio?.buzz();
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const rv = createRevealView({
          ctx,
          leftWord: ctx.t('reveal.creator.left'),
          rightWord: ctx.t('reveal.creator.right'),
          leftIcon: 'cross',
          rightIcon: 'check',
          claim: ctx.claim('C-03'),
          extraNote: ctx.t('scene.creator.baseline'),
          onComplete: completeScene,
        });
        cleanupReveal = rv.cleanup;
        center.replaceChildren();
        revealHost.replaceChildren(rv.element);
      };

      const loop = createLoop();
      loop.start((dtMs, tMs) => {
        if (phase === 'PLAY') {
          fillPct = stepCreatorFill(fillPct, held, tMs, dtMs);
          const rounded = Math.round(fillPct);
          pctEl.textContent = `${rounded}%`;
          holdBtn.style.setProperty('--ring-deg', `${Math.round(rounded * 3.6)}deg`);

          if (tMs >= 8000 && !stuttered) {
            stuttered = true;
            audio?.buzz();
            ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
            holdBtn.classList.add('rm-export-btn--stutter');
            holdBtn.dataset.testid = 'creator-stutter';
          }
          if (tMs >= playMs) enterReveal();
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
