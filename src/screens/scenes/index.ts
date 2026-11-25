import type { Audio, Ctx, SceneId, SceneResult } from '../../core/types';
import { createButton } from '../../ui/components/button';
import { createBatteryScene } from '../scene-battery';
import { createLectureScene } from '../scene-lecture';

export interface SceneFactory {
  mount(
    playArea: HTMLElement,
    ctx: Ctx,
    onDone: (result: SceneResult) => void,
  ): () => void;
}

function createStubScene(sceneId: SceneId): SceneFactory {
  return {
    mount(playArea, ctx, onDone) {
      const box = document.createElement('div');
      box.className = 'rm-scene-play';
      box.dataset.stub = 'true';

      const badge = document.createElement('p');
      badge.className = 'type-title';
      badge.textContent = `SCENE_NOT_BUILT: ${sceneId}`;

      const skip = createButton({
        label: ctx.t('btn.skip'),
        onClick: () => {
          onDone({
            sceneId,
            playerScore: 0,
            events: [{ sceneId, lineKey: `regret.${sceneId}`, points: 0 }],
            stub: true,
          });
        },
      });

      box.append(badge, skip);
      playArea.replaceChildren(box);
      return () => {};
    },
  };
}

export function createSceneRegistry(audio?: Audio): Record<SceneId, SceneFactory> {
  return {
    lecture: createLectureScene(audio),
    battery: createBatteryScene(audio),
    creator: createStubScene('creator'),
    private: createStubScene('private'),
  };
}
