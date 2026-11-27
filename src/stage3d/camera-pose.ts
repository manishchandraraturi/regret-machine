import * as THREE from 'three';
import type { StageState } from './scenes3d';

export function updateCameraPose(
  camera: THREE.PerspectiveCamera,
  state: StageState,
  tSec: number,
  pointerX: number,
  pointerY: number,
  portrait: boolean,
  snap: boolean,
): void {
  const aspectScale = portrait ? Math.max(1.2, 0.9 / Math.max(0.45, camera.aspect)) : 1;
  const pushOffset = state.buyFlash ? -1.1 : 0;
  const isResultLike = state.screen === 'result' || state.screen === 'staff';
  const isReveal =
    (state.screen === 'lecture' || state.screen === 'battery' || state.screen === 'creator' || state.screen === 'private') &&
    state.scenePhase === 'REVEAL';
  const baseZ =
    state.screen === 'attract'
      ? 5.6 + (snap ? 0 : Math.sin(tSec * 0.35) * 0.22)
      : state.screen === 'shelf'
        ? 6.3
        : isReveal
          ? portrait ? 6.4 : 5.8
          : state.screen === 'receipt'
            ? 4.9
            : isResultLike
              ? 6.0
              : state.screen === 'fairfight'
                ? 5.4
                : 5.0;
  const dollyZ = baseZ * aspectScale + pushOffset;
  const dollyY =
    state.screen === 'receipt'
      ? 2.1
      : isResultLike
        ? 1.95
        : state.screen === 'shelf'
          ? 1.92
          : portrait
            ? 1.6
            : 1.68;
  const camAlpha = snap ? 1 : 0.08;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * 0.32, camAlpha);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, dollyY + pointerY * 0.16, camAlpha);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, dollyZ, camAlpha);
  const lookY = isResultLike
    ? 0.56
    : state.screen === 'shelf'
      ? 0.22
      : state.screen === 'fairfight'
        ? 0.36
        : isReveal
          ? portrait ? 0.24 : 0.40
          : 0.45;
  camera.lookAt(0, lookY, 0);
}
