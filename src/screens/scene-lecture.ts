import { getScenesConfig } from '../core/data';
import { scoreLecture } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createRevealView } from './reveal-view';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';
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

      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'rm-dots';
      dotsWrap.setAttribute('role', 'status');
      dotsWrap.setAttribute('aria-label', `0 / ${notesTotal}`);
      const dots: HTMLElement[] = [];
      for (let i = 0; i < notesTotal; i += 1) {
        const d = document.createElement('span');
        d.className = 'rm-dot';
        dots.push(d);
        dotsWrap.appendChild(d);
      }

      const wifiPill = document.createElement('div');
      wifiPill.className = 'rm-wifi-pill';
      wifiPill.append(makeSvgIcon(ICON_PATHS.wifi, 'rm-wifi-icon'));

      const summaryCard = document.createElement('div');
      summaryCard.className = 'rm-summary-card';
      summaryCard.textContent = ctx.t('scene.lecture.summary');

      hud.append(dotsWrap, summaryCard, wifiPill);

      const arena = document.createElement('div');
      arena.className = 'rm-lecture-lanes';

      const revealHost = document.createElement('div');
      wrap.append(hud, arena, revealHost);
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

      const spawnNote = (index: number): void => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rm-sticky-note';
        btn.dataset.noteIndex = String(index);
        btn.style.gridColumn = String((index % 3) + 1);
        btn.setAttribute('aria-label', `#${index + 1}`);
        btn.append(makeSvgIcon(ICON_PATHS.note, 'rm-note-icon'));

        btn.addEventListener('click', () => {
          if (phase !== 'PLAY' || btn.getAttribute('aria-disabled') === 'true') return;
          btn.setAttribute('aria-disabled', 'true');
          btn.classList.add('rm-sticky-note--caught');
          if (dots[caught]) dots[caught].classList.add('rm-dot--filled');
          caught += 1;
          dotsWrap.setAttribute('aria-label', `${caught} / ${notesTotal}`);
          summaryCard.dataset.progress = String(caught);
          audio?.chime();
        });
        arena.appendChild(btn);
      };

      const triggerWifiDrop = (): void => {
        if (wifiDropped) return;
        wifiDropped = true;
        audio?.buzz();
        ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
        wifiPill.classList.add('rm-wifi-pill--dropped');
        wifiPill.dataset.testid = 'wifi-drop-banner';
        summaryCard.classList.add('rm-summary-card--glitch');
        summaryCard.textContent = ctx.t('scene.lecture.nowifi');
      };

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });

        const rv = createRevealView({
          ctx,
          leftWord: ctx.t('reveal.lecture.left'),
          rightWord: ctx.t('reveal.lecture.right'),
          leftIcon: 'cross',
          rightIcon: 'check',
          claim: ctx.claim('C-02'),
          onComplete: completeScene,
        });
        cleanupReveal = rv.cleanup;
        arena.replaceChildren();
        hud.replaceChildren();
        revealHost.replaceChildren(rv.element);
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        if (phase === 'PLAY') {
          const target = Math.min(notesTotal, Math.floor(tMs / 1800) + 1);
          while (spawned < target) {
            spawnNote(spawned);
            spawned += 1;
          }
          if (tMs >= wifiDropAtMs) triggerWifiDrop();
          if (tMs >= playMs) enterReveal();
        } else if (tMs >= totalMs) {
          completeScene();
        }
      });

      const detachInput = attachInput(window, (ev) => {
        if (phase !== 'PLAY') return;
        const buttons = arena.querySelectorAll<HTMLButtonElement>('button:not([aria-disabled="true"])');
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
