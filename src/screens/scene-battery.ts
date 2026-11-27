import { getScenesConfig } from '../core/data';
import { scoreBattery } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createButton } from '../ui/components/button';
import { createClaimChip } from '../ui/components/claimchip';
import { createSplitReveal } from '../ui/components/splitreveal';
import { createRevealControls } from './reveal-controls';
import type { SceneFactory } from './scenes';

const CLOCK_LABELS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:30',
  '15:30',
  '16:30',
  '17:30',
  '19:00',
] as const;

export function createBatteryScene(audio?: Audio): SceneFactory {
  return {
    mount(playArea: HTMLElement, ctx: Ctx, onDone: (result: SceneResult) => void): () => void {
      const meta = getScenesConfig().scenes.battery;
      const totalTasks = 10;
      const playMs = meta.playMs;
      const totalMs = meta.durationMs;

      let tasksSpawned = 0;
      let tasksDone = 0;
      let lowAlerted = false;
      let phase: 'PLAY' | 'FAIL' | 'REVEAL' = 'PLAY';
      let finished = false;
      let cleanupReveal: (() => void) | null = null;

      const wrap = document.createElement('div');
      wrap.className = 'rm-scene-play';
      wrap.dataset.phase = 'PLAY';

      const hud = document.createElement('div');
      hud.className = 'rm-scene-hud';

      const clockEl = document.createElement('span');
      clockEl.className = 'type-body';
      clockEl.dataset.testid = 'battery-clock';
      clockEl.textContent = CLOCK_LABELS[0];

      const scoreEl = document.createElement('span');
      scoreEl.className = 'type-body';
      scoreEl.dataset.testid = 'battery-score';
      scoreEl.textContent = `0 / ${totalTasks}`;

      hud.append(clockEl, scoreEl);

      const bar = document.createElement('div');
      bar.className = 'rm-battery-bar';
      const fill = document.createElement('div');
      fill.className = 'rm-battery-fill';
      fill.style.setProperty('width', '100%');
      bar.appendChild(fill);

      const taskGrid = document.createElement('div');
      taskGrid.className = 'rm-task-grid';

      const revealHost = document.createElement('div');
      wrap.append(hud, bar, taskGrid, revealHost);
      playArea.replaceChildren(wrap);

      const completeScene = (): void => {
        if (finished) return;
        finished = true;
        cleanupReveal?.();
        loop.stop();
        detachInput();
        onDone({
          sceneId: 'battery',
          playerScore: scoreBattery(tasksDone, totalTasks),
          events: [
            { sceneId: 'battery', lineKey: 'regret.battery', points: 0 },
            { sceneId: 'battery', lineKey: 'scene.battery.fail', points: 0 },
          ],
        });
      };

      const spawnTask = (idx: number): void => {
        const btn = createButton({
          label: `${CLOCK_LABELS[idx] ?? '19:00'}`,
          variant: 'secondary',
          onClick: () => {
            if (phase !== 'PLAY' || btn.getAttribute('aria-disabled') === 'true') return;
            btn.setAttribute('aria-disabled', 'true');
            tasksDone += 1;
            scoreEl.textContent = `${tasksDone} / ${totalTasks}`;
            audio?.chime();
          },
        });
        btn.dataset.taskIndex = String(idx);
        taskGrid.appendChild(btn);
      };

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'FAIL';
        wrap.dataset.phase = 'FAIL';
        audio?.buzz();
        fill.style.setProperty('width', '0%');
        fill.classList.add('rm-battery-fill--low');

        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const state = ctx.store.getState();
        const split = createSplitReveal({
          decay: state.decay,
          leftTitle: ctx.t('reveal.left'),
          leftBody: ctx.t('scene.battery.fail'),
          rightTitle: ctx.t('reveal.right'),
          rightBody: ctx.t('scene.battery.win'),
          claimText: `${ctx.claim('C-05').text[state.lang]} (${ctx.t('tag.intel-claimed')})`,
        });

        const claimsRow = document.createElement('div');
        claimsRow.className = 'rm-claims-row';
        const seenClaims = new Set<string>();
        for (const cid of meta.claims) {
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

        taskGrid.replaceChildren();
        revealHost.replaceChildren(split, claimsRow, revealCtrl.element);
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        if (phase === 'PLAY') {
          const pct = Math.max(0, Math.round((1 - tMs / playMs) * 100));
          fill.style.setProperty('width', `${pct}%`);
          if (pct <= 30) {
            fill.classList.add('rm-battery-fill--low');
            if (!lowAlerted) {
              lowAlerted = true;
              ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
            }
          }

          const targetSpawned = Math.min(totalTasks, Math.floor(tMs / 1600) + 1);
          while (tasksSpawned < targetSpawned) {
            spawnTask(tasksSpawned);
            clockEl.textContent = CLOCK_LABELS[tasksSpawned] ?? '14:30';
            tasksSpawned += 1;
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
        const buttons = taskGrid.querySelectorAll<HTMLButtonElement>(
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
