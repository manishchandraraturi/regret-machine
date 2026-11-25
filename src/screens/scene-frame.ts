import { getScenesConfig } from '../core/data';
import { computeRegret } from '../core/scoring';
import type { Ctx, SceneId, SceneResult, Screen, ScreenId } from '../core/types';
import { createTape } from '../ui/components/tape';
import { tweenDecay } from '../ui/decay';
import { sceneRegistry } from './scenes';

export function createSceneFrameScreen(
  sceneId: SceneId,
  nextScreen: ScreenId,
  decayScope: HTMLElement,
): Screen {
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

      const timer = document.createElement('span');
      timer.className = 'rm-timer-ring';
      timer.textContent = `${Math.round(meta.durationMs / 1000)}s`;

      head.append(yearChip, title, timer);

      const playArea = document.createElement('div');
      const tape = createTape(ctx.t('receipt.title'));
      const state = ctx.store.getState();
      const persona = state.persona ?? 'study';
      const currentBreakdown = computeRegret(persona, state.results, config);
      for (const r of state.results) {
        const pts = currentBreakdown.lines.find((l) => l.sceneId === r.sceneId)?.points ?? 0;
        tape.addLine({ label: ctx.t(`regret.${r.sceneId}`), points: pts });
      }

      const hint = document.createElement('p');
      hint.className = 'type-body';
      hint.textContent = ctx.t(`scene.${sceneId}.hint`);

      stage.append(head, tape.element, playArea, hint);
      root.replaceChildren(stage);

      const factory = sceneRegistry[sceneId];
      const cleanupScene = factory.mount(playArea, ctx, (result: SceneResult) => {
        ctx.store.addSceneResult(result);
        const prevDecay = ctx.store.getState().decay;
        const nextDecay = Math.min(1, prevDecay + config.decayPerScene);
        ctx.store.setDecay(nextDecay);
        void tweenDecay(decayScope, prevDecay, nextDecay, 1200);
        ctx.go(nextScreen);
      });

      return () => {
        cleanupScene();
      };
    },
  };
}
