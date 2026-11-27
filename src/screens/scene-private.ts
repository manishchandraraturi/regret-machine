import { getScenesConfig } from '../core/data';
import { scorePrivate } from '../core/scoring';
import type { Audio, Ctx, SceneResult } from '../core/types';
import { attachInput } from '../engines/input';
import { createLoop } from '../engines/loop';
import { createButton } from '../ui/components/button';
import { createRevealView } from './reveal-view';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';
import type { SceneFactory } from './scenes';

export function createPrivateScene(audio?: Audio): SceneFactory {
  return {
    mount(playArea: HTMLElement, ctx: Ctx, onDone: (result: SceneResult) => void): () => void {
      const meta = getScenesConfig().scenes.private;
      const files = meta.files ?? [];
      const playMs = meta.playMs;
      const totalMs = meta.durationMs;
      const perCardMs = 2600;

      let activeIdx = 0;
      let cardStartMs = 0;
      let correct = 0;
      const answered = new Set<string>();
      let phase: 'PLAY' | 'FAIL' | 'REVEAL' = 'PLAY';
      let finished = false;
      let cleanupReveal: (() => void) | null = null;

      const wrap = document.createElement('div');
      wrap.className = 'rm-scene-play';
      wrap.dataset.phase = 'PLAY';

      const cardSlot = document.createElement('div');
      cardSlot.className = 'rm-private-stage';

      const uploadBar = document.createElement('div');
      uploadBar.className = 'rm-upload-bar';
      const uploadFill = document.createElement('div');
      uploadFill.className = 'rm-upload-fill';
      uploadBar.appendChild(uploadFill);
      uploadBar.hidden = true;

      const decisionRow = document.createElement('div');
      decisionRow.className = 'rm-private-actions';

      const renderCard = (): void => {
        const f = files[activeIdx];
        if (!f) return;
        const card = document.createElement('div');
        card.className = 'rm-file-hero';
        card.dataset.fileId = f.id;
        card.append(makeSvgIcon(ICON_PATHS.file, 'rm-file-hero-icon'));
        if (f.sensitive) {
          const lock = makeSvgIcon(ICON_PATHS.lock, 'rm-file-lock');
          card.append(lock);
        }
        const label = document.createElement('p');
        label.className = 'type-title';
        label.textContent = ctx.t(`file.${f.id}`);
        card.append(label);
        cardSlot.replaceChildren(card);
      };

      const completeScene = (): void => {
        if (finished) return;
        finished = true;
        cleanupReveal?.();
        loop.stop();
        detachInput();
        onDone({
          sceneId: 'private',
          playerScore: scorePrivate(correct, files.length),
          events: [{ sceneId: 'private', lineKey: 'regret.private', points: 0 }],
        });
      };

      const advanceCard = (choice: 'allow' | 'keep', nowMs: number): void => {
        if (phase !== 'PLAY') return;
        const file = files[activeIdx];
        if (!file || answered.has(file.id)) return;
        answered.add(file.id);
        const isCorrect = (file.sensitive && choice === 'keep') || (!file.sensitive && choice === 'allow');
        if (isCorrect) {
          correct += 1;
          audio?.chime();
        } else {
          audio?.buzz();
          if (file.sensitive && choice === 'allow') {
            uploadBar.hidden = false;
            ctx.setStageHint?.({ scenePhase: 'FAIL', sceneAlert: true });
          }
        }
        const nextIdx = files.findIndex((f) => !answered.has(f.id));
        if (nextIdx >= 0) {
          activeIdx = nextIdx;
          cardStartMs = nowMs;
          renderCard();
        }
      };

      let lastTMs = 0;
      decisionRow.append(
        createButton({
          label: ctx.t('scene.private.share'),
          variant: 'secondary',
          onClick: () => advanceCard('allow', lastTMs),
        }),
        createButton({
          label: ctx.t('scene.private.keep'),
          onClick: () => advanceCard('keep', lastTMs),
        }),
      );

      const revealHost = document.createElement('div');
      wrap.append(cardSlot, uploadBar, decisionRow, revealHost);
      playArea.replaceChildren(wrap);
      renderCard();

      const enterReveal = (): void => {
        if (phase === 'REVEAL') return;
        phase = 'REVEAL';
        wrap.dataset.phase = 'REVEAL';
        audio?.buzz();

        const rv = createRevealView({
          ctx,
          leftWord: ctx.t('reveal.private.left'),
          rightWord: ctx.t('reveal.private.right'),
          leftIcon: 'cloud',
          rightIcon: 'shield',
          extraNote: ctx.t('scene.private.note'),
          onComplete: completeScene,
        });
        cleanupReveal = rv.cleanup;
        cardSlot.replaceChildren();
        decisionRow.replaceChildren();
        uploadBar.hidden = true;
        revealHost.replaceChildren(rv.element);
        ctx.setStageHint?.({ scenePhase: 'REVEAL', sceneAlert: true });
      };

      const loop = createLoop();
      loop.start((_dt, tMs) => {
        lastTMs = tMs;
        if (phase === 'PLAY') {
          if (tMs - cardStartMs >= perCardMs && answered.size < files.length) {
            advanceCard('keep', tMs);
          }
          if (tMs >= playMs) enterReveal();
        } else if (tMs >= totalMs) {
          completeScene();
        }
      });

      const detachInput = attachInput(window, (ev) => {
        if (phase !== 'PLAY') return;
        if (ev.kind === 'select' && ev.index === 0) advanceCard('allow', lastTMs);
        else if (ev.kind === 'confirm' || (ev.kind === 'select' && ev.index === 1)) advanceCard('keep', lastTMs);
      });

      return () => {
        cleanupReveal?.();
        loop.stop();
        detachInput();
      };
    },
  };
}
