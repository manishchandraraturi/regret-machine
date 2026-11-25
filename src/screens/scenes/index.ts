import type { Audio, Ctx, SceneId, SceneResult } from '../../core/types';
import { createBatteryScene } from '../scene-battery';
import { createCreatorScene } from '../scene-creator';
import { createLectureScene } from '../scene-lecture';
import { createPrivateScene } from '../scene-private';

export interface SceneFactory {
  mount(
    playArea: HTMLElement,
    ctx: Ctx,
    onDone: (result: SceneResult) => void,
  ): () => void;
}

export function createSceneRegistry(audio?: Audio): Record<SceneId, SceneFactory> {
  return {
    lecture: createLectureScene(audio),
    battery: createBatteryScene(audio),
    creator: createCreatorScene(audio),
    private: createPrivateScene(audio),
  };
}
