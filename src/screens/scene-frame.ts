import { getScenesConfig } from '../core/data';
import type { Audio, Ctx, SceneId, SceneResult, Screen, ScreenId } from '../core/types';
import { tweenDecay } from '../ui/decay';
import { createSceneIntro, createStakeMeter } from './scene-hud';
import { createSceneRegistry } from './scenes';

export function createSceneFrameScreen(
  sceneId: SceneId,
  nextScreen: ScreenId,
  decayScope: HTMLElement,
  audio?: Audio,
): Screen {
  const registry = createSceneRegistry(audio);

  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const config = getScenesConfig();
      const meta = config.scenes[sceneId];

      const stage = document.createElement('section');
      stage.className = 'stage';
      stage.dataset.screen = sceneId;

      const head = document.createElement('div');
      head.className = 'rm-scene-head';

      const yearChip = document.createElement('span');
      yearChip.className = 'rm-scene-year';
      yearChip.textContent = ctx.t(`year.${meta.year}`);

      const title = document.createElement('h1');
      title.className = 'type-title';
      title.textContent = ctx.t(`scene.${sceneId}.title`);

      const stakeMeter = createStakeMeter(sceneId, ctx);
      const intro = createSceneIntro(sceneId, meta.year, ctx);

      head.append(yearChip, title, stakeMeter.element);

      const hint = document.createElement('p');
      hint.className = 'type-body rm-scene-hint rm-scrim';
      hint.textContent = ctx.t(`scene.${sceneId}.hint`);

      const playArea = document.createElement('div');
      const stageWin = document.createElement('div');
      stageWin.className = 'stage-window';
      stageWin.setAttribute('aria-hidden', 'true');

      const layout = document.createElement('div');
      layout.className = 'rm-scene-layout';
      layout.append(playArea, stageWin);

      const fadeHint = (): void => {
        hint.classList.add('rm-scene-hint--faded');
        intro.dismiss();
      };
      stage.addEventListener('pointerdown', fadeHint, { once: true });

      const startAt = Date.now();
      const meterTimer = window.setInterval(() => {
        const tMs = Date.now() - startAt;
        stakeMeter.update(tMs);
        if (tMs >= meta.playMs) intro.dismiss();
      }, 200);

      stage.append(head, intro.element, hint, layout);
      root.replaceChildren(stage);

      const factory = registry[sceneId];
      const cleanupScene = factory.mount(playArea, ctx, (result: SceneResult) => {
        window.clearInterval(meterTimer);
        intro.dismiss();
        ctx.store.addSceneResult(result);
        const prevDecay = ctx.store.getState().decay;
        const nextDecay = Math.min(1, prevDecay + config.decayPerScene);
        ctx.store.setDecay(nextDecay);
        void tweenDecay(decayScope, prevDecay, nextDecay, 1200);
        ctx.go(nextScreen);
      });

      return () => {
        window.clearInterval(meterTimer);
        intro.dismiss();
        stage.removeEventListener('pointerdown', fadeHint);
        cleanupScene();
      };
    },
  };
}
