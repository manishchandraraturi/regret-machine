import { getScenesConfig } from '../core/data';
import { scorePrivate } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createButton } from '../ui/components/button';
import { createSplitReveal } from '../ui/components/splitreveal';
import type { SceneFactory } from './scenes';

export function createPrivateScene(audio?: Audio): SceneFactory {
  return {
    mount(playArea: HTMLElement, ctx: Ctx, onDone: (result: SceneResult) => void): () => void {
      const meta = getScenesConfig().scenes.private;
      const files = meta.files ?? [];
      const playMs = meta.playMs;
      const totalMs = meta.durationMs;

      let activeIdx = 0;
      const answered = new Set<string>();
      let correct = 0;
      let phase: 'PLAY' | 'FAIL' | 'REVEAL' = 'PLAY';
      let finished = false;

      const wrap = document.createElement('div');
      wrap.className = 'rm-scene-play';
      wrap.dataset.phase = 'PLAY';

      const hud = document.createElement('div');
      hud.className = 'rm-scene-hud';

      const statusEl = document.createElement('span');
      statusEl.className = 'type-body';
      statusEl.dataset.testid = 'private-count';
      statusEl.textContent = `0 / ${files.length}`;
      hud.appendChild(statusEl);

      const uploadBanner = document.createElement('p');
      uploadBanner.className = 'rm-wifi-banner type-body';
      uploadBanner.dataset.testid = 'upload-banner';
      uploadBanner.textContent = ctx.t('scene.private.upload');

      const cardsRow = document.createElement('div');
      cardsRow.className = 'rm-task-grid';

      const decisionRow = document.createElement('div');
      decisionRow.className = 'rm-controls';

      const revealHost = document.createElement('div');
      wrap.append(hud, uploadBanner, cardsRow, decisionRow, revealHost);
      playArea.replaceChildren(wrap);

      const completeScene = (): void => {
        if (finished) return;
        finished = true;
        loop.stop();
        detachInput();
        onDone({
          sceneId: 'private',
          playerScore: scorePrivate(correct, files.length),
          events: [{ sceneId: 'private', lineKey: 'regret.private', points: 0 }],
        });
      };

      const cardButtons = files.map((file, idx) => {
        const btn = createButton({
          label: ctx.t(`file.${file.id}`),
          variant: 'secondary',
          onClick: () => {
            if (phase !== 'PLAY' || answered.has(file.id)) return;
            activeIdx = idx;
          },
        });
        btn.dataset.fileId = file.id;
        cardsRow.appendChild(btn);
        return btn;
      });

      const handleDecision = (choice: 'allow' | 'keep'): void => {
        if (phase !== 'PLAY') return;
        const file = files[activeIdx];
        if (!file || answered.has(file.id)) return;

        answered.add(file.id);
        cardButtons[activeIdx]?.setAttribute('aria-disabled', 'true');
        const isCorrect =
          (file.sensitive && choice === 'keep') || (!file.sensitive && choice === 'allow');
        if (isCorrect) {
          correct += 1;
          audio?.chime();
        } else {
          audio?.buzz();
        }
        statusEl.textContent = `${answered.size} / ${files.length}`;

        const nextPending = files.findIndex((f) => !answered.has(f.id));
        if (nextPending >= 0) activeIdx = nextPending;
      };

      decisionRow.append(
        createButton({
          label: ctx.t('scene.private.allow'),
          variant: 'secondary',
          onClick: () => handleDecision('allow'),
        }),
        createButton({
          label: ctx.t('scene.private.keep'),
          onClick: () => handleDecision('keep'),
        }),
      );

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'FAIL';
        wrap.dataset.phase = 'FAIL';
        audio?.buzz();
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';

        const state = ctx.store.getState();
        const split = createSplitReveal({
          decay: state.decay,
          leftTitle: ctx.t('reveal.left'),
          leftBody: ctx.t('scene.private.fail'),
          rightTitle: ctx.t('reveal.right'),
          rightBody: ctx.t('scene.private.win'),
          claimText: `${ctx.t('scene.private.note')} (${ctx.t('tag.our-advice')})`,
        });

        const nextBtn = createButton({
          label: ctx.t('btn.next'),
          onClick: completeScene,
        });

        cardsRow.replaceChildren();
        decisionRow.replaceChildren();
        revealHost.replaceChildren(split, nextBtn);
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        if (phase === 'PLAY' && tMs >= playMs) {
          enterReveal();
        } else if (phase === 'REVEAL' && tMs >= totalMs) {
          completeScene();
        }
      });

      const detachInput = attachInput(window, (ev) => {
        if (phase !== 'PLAY') return;
        if (ev.kind === 'select' && files[ev.index]) {
          activeIdx = ev.index;
        } else if (ev.kind === 'confirm') {
          handleDecision('keep');
        }
      });

      return () => {
        loop.stop();
        detachInput();
      };
    },
  };
}
