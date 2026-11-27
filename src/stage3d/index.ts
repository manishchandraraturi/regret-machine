import { shouldUse3DStage } from './fallback';
import type { StageState } from './scenes3d';
import type { Stage3DController } from './stage';

export type { StageState } from './scenes3d';

export interface Stage3DHandle {
  active: boolean;
  sync(next: StageState): void;
  getQuality(): ReturnType<Stage3DController['getQuality']> | null;
  dispose(): void;
}

export async function mountStage3D(
  host: HTMLElement,
  initialState: StageState,
  search = typeof window !== 'undefined' ? window.location.search : '',
): Promise<Stage3DHandle> {
  const decision = shouldUse3DStage(search);
  if (!decision.enabled) {
    host.dataset.stageMode = 'fallback';
    host.dataset.stageReason = decision.reason ?? 'unknown';
    return {
      active: false,
      sync(): void {},
      getQuality(): null {
        return null;
      },
      dispose(): void {},
    };
  }

  let canvas = document.getElementById('stage3d') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'stage3d';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'rm-stage3d';
    host.prepend(canvas);
  }

  let ctrl: Stage3DController | null = null;
  const disable = (reason: string): void => {
    ctrl?.dispose();
    ctrl = null;
    canvas?.remove();
    host.dataset.stageMode = 'fallback';
    host.dataset.stageReason = reason;
  };

  try {
    const mod = await import('./stage');
    ctrl = mod.createWebGLStage(canvas, initialState, () => disable('context-lost'));
    canvas.classList.add('rm-stage3d--ready');
    host.dataset.stageMode = 'webgl2';
    host.dataset.stageReason = 'ok';
  } catch {
    disable('init-error');
    return {
      active: false,
      sync(): void {},
      getQuality(): null {
        return null;
      },
      dispose(): void {},
    };
  }

  return {
    active: true,
    sync(next: StageState): void {
      ctrl?.sync(next);
    },
    getQuality() {
      return ctrl ? ctrl.getQuality() : null;
    },
    dispose(): void {
      ctrl?.dispose();
      canvas?.remove();
    },
  };
}
