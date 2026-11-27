import { getScenesConfig } from '../core/data';
import { scoreLecture } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createButton } from '../ui/components/button';
import { createClaimChip } from '../ui/components/claimchip';
import { createSplitReveal } from '../ui/components/splitreveal';
import { createRevealControls } from './reveal-controls';
import type { SceneFactory } from './scenes';

export function createLectureScene(audio?: Audio): SceneFactory {
  return {
    mount(playArea: HTMLElement, ctx: Ctx, onDone: (result: SceneResult) => void): () => void {
      const meta = getScenesConfig().scenes.lecture;
      const notesTotal = 8;
      const playMs = meta.playMs;
      const totalMs = meta.durationMs;
      const wifiDropAtMs = 9000;

      let spawned = 0;
      let caught = 0;
      let wifiDropped = false;
      let phase: 'PLAY' | 'FAIL' | 'REVEAL' = 'PLAY';
      let finished = false;
      let cleanupReveal: (() => void) | null = null;

      const wrap = document.createElement('div');
      wrap.className = 'rm-scene-play';
      wrap.dataset.phase = 'PLAY';

      const hud = document.createElement('div');
      hud.className = 'rm-scene-hud';

      const caughtEl = document.createElement('span');
      caughtEl.className = 'type-body';
      caughtEl.dataset.testid = 'lecture-caught';
      caughtEl.textContent = `0 / ${notesTotal}`;

      hud.appendChild(caughtEl);

      const wifiSlot = document.createElement('div');
      const arena = document.createElement('div');
      arena.className = 'rm-notes-arena';
      const revealHost = document.createElement('div');

      wrap.append(hud, wifiSlot, arena, revealHost);
      playArea.replaceChildren(wrap);

      const completeScene = (): void => {
        if (finished) return;
        finished = true;
        cleanupReveal?.();
        loop.stop();
        detachInput();
        onDone({
          sceneId: 'lecture',
          playerScore: scoreLecture(caught, notesTotal),
          events: [{ sceneId: 'lecture', lineKey: 'regret.lecture', points: 0 }],
        });
      };

      const spawnNote = (idx: number): void => {
        const btn = createButton({
          label: `#${idx + 1}`,
          variant: 'secondary',
          onClick: () => {
            if (phase !== 'PLAY' || btn.getAttribute('aria-disabled') === 'true') return;
            btn.setAttribute('aria-disabled', 'true');
            caught += 1;
            caughtEl.textContent = `${caught} / ${notesTotal}`;
            audio?.chime();
          },
        });
        btn.dataset.noteIndex = String(idx);
        arena.appendChild(btn);
      };

      const triggerWifiDrop = (): void => {
        if (wifiDropped) return;
        wifiDropped = true;
        audio?.buzz();
        const banner = document.createElement('p');
        banner.className = 'rm-wifi-banner type-body';
        banner.dataset.testid = 'wifi-drop-banner';
        banner.textContent = ctx.t('scene.lecture.fail');
        wifiSlot.replaceChildren(banner);
        ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
      };

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'FAIL';
        wrap.dataset.phase = 'FAIL';
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const state = ctx.store.getState();
        const c02 = ctx.claim('C-02');
        const split = createSplitReveal({
          decay: state.decay,
          leftTitle: ctx.t('reveal.left'),
          leftBody: ctx.t('scene.lecture.fail.detail'),
          rightTitle: ctx.t('reveal.right'),
          rightBody: ctx.t('scene.lecture.win'),
          claimText: `${c02.text[state.lang]} (${ctx.t(`tag.${c02.tag}`)})`,
        });

        const gloss = document.createElement('p');
        gloss.className = 'rm-glossary type-small';
        gloss.dataset.testid = 'npu-gloss';
        gloss.textContent = ctx.t('glossary.npu');

        const chip = createClaimChip({
          claim: c02,
          tagLabel: ctx.t(`tag.${c02.tag}`),
          closeLabel: ctx.t('btn.close'),
        });

        const revealCtrl = createRevealControls(ctx, completeScene);
        cleanupReveal = revealCtrl.cleanup;

        arena.replaceChildren();
        revealHost.replaceChildren(split, gloss, chip, revealCtrl.element);
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        if (phase === 'PLAY') {
          const target = Math.min(notesTotal, Math.floor(tMs / 1800) + 1);
          while (spawned < target) {
            spawnNote(spawned);
            spawned += 1;
          }
          if (tMs >= wifiDropAtMs) {
            triggerWifiDrop();
          }
          if (tMs >= playMs) {
            enterReveal();
          }
        } else if (tMs >= totalMs) {
          completeScene();
        }
      });

      const detachInput = attachInput(window, (ev) => {
        if (phase !== 'PLAY') return;
        const buttons = arena.querySelectorAll<HTMLButtonElement>(
          'button:not([aria-disabled="true"])',
        );
        if (ev.kind === 'select' && buttons[ev.index]) {
          buttons[ev.index].click();
        } else if (ev.kind === 'confirm' && buttons[0]) {
          buttons[0].click();
        }
      });

      return () => {
        cleanupReveal?.();
        loop.stop();
        detachInput();
      };
    },
  };
}
