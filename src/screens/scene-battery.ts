import { getScenesConfig } from '../core/data';
import { scoreBattery } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createRevealView } from './reveal-view';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';
import type { SceneFactory } from './scenes';

const TASK_ICONS: Array<keyof typeof ICON_PATHS> = ['meeting', 'send', 'share'];
const CLOCK_LABELS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:30', '15:30', '16:30', '17:30', '19:00'] as const;

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

      const clockWrap = document.createElement('span');
      clockWrap.className = 'rm-clock-pill';
      clockWrap.dataset.testid = 'battery-clock';
      const clockText = document.createElement('span');
      clockText.textContent = CLOCK_LABELS[0];
      clockWrap.append(makeSvgIcon(ICON_PATHS.clock, 'rm-clock-icon'), clockText);

      const batteryHero = document.createElement('div');
      batteryHero.className = 'rm-battery-hero';
      const fill = document.createElement('div');
      fill.className = 'rm-battery-hero-fill';
      fill.style.setProperty('transform', 'scaleX(1)');
      const pctLabel = document.createElement('span');
      pctLabel.className = 'rm-battery-pct';
      pctLabel.textContent = '100%';
      batteryHero.append(fill, pctLabel);

      hud.append(batteryHero, clockWrap);

      const taskGrid = document.createElement('div');
      taskGrid.className = 'rm-bubble-arena';

      const revealHost = document.createElement('div');
      wrap.append(hud, taskGrid, revealHost);
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
        const iconKey = TASK_ICONS[idx % TASK_ICONS.length] ?? 'meeting';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rm-task-bubble';
        btn.dataset.taskIndex = String(idx);
        btn.setAttribute('aria-label', CLOCK_LABELS[idx] ?? '19:00');
        btn.append(makeSvgIcon(ICON_PATHS[iconKey], 'rm-bubble-icon'));
        btn.addEventListener('click', () => {
          if (phase !== 'PLAY' || btn.getAttribute('aria-disabled') === 'true') return;
          btn.setAttribute('aria-disabled', 'true');
          btn.classList.add('rm-task-bubble--done');
          tasksDone += 1;
          audio?.chime();
        });
        taskGrid.appendChild(btn);
      };

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        audio?.buzz();
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const rv = createRevealView({
          ctx,
          leftWord: ctx.t('reveal.battery.left'),
          rightWord: ctx.t('reveal.battery.right'),
          leftIcon: 'batteryEmpty',
          rightIcon: 'zap',
          claim: ctx.claim('C-05'),
          onComplete: completeScene,
        });
        cleanupReveal = rv.cleanup;
        hud.replaceChildren();
        taskGrid.replaceChildren();
        revealHost.replaceChildren(rv.element);
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        if (phase === 'PLAY') {
          const ratio = Math.max(0, 1 - tMs / playMs);
          fill.style.setProperty('transform', `scaleX(${ratio.toFixed(3)})`);
          pctLabel.textContent = `${Math.round(ratio * 100)}%`;
          if (ratio <= 0.3) {
            fill.classList.add('rm-battery-hero-fill--low');
            if (!lowAlerted) {
              lowAlerted = true;
              ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
            }
          }

          const targetSpawned = Math.min(totalTasks, Math.floor(tMs / 1600) + 1);
          while (tasksSpawned < targetSpawned) {
            spawnTask(tasksSpawned);
            clockText.textContent = CLOCK_LABELS[tasksSpawned] ?? '14:30';
            tasksSpawned += 1;
          }
          if (tMs >= playMs) enterReveal();
        } else if (tMs >= totalMs) {
          completeScene();
        }
      });

      const detachInput = attachInput(window, (ev) => {
        if (phase !== 'PLAY') return;
        const buttons = taskGrid.querySelectorAll<HTMLButtonElement>('button:not([aria-disabled="true"])');
        if (ev.kind === 'select' && buttons[ev.index]) buttons[ev.index].click();
        else if (ev.kind === 'confirm' && buttons[0]) buttons[0].click();
      });

      return () => {
        cleanupReveal?.();
        loop.stop();
        detachInput();
      };
    },
  };
}
