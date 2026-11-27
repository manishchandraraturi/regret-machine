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
  const baseZ =
    state.screen === 'attract'
      ? 5.6 + (snap ? 0 : Math.sin(tSec * 0.35) * 0.22)
      : state.screen === 'shelf'
        ? 6.3
        : state.screen === 'receipt'
          ? 4.4
          : isResultLike
            ? 6.0
            : state.screen === 'fairfight'
              ? 6.6
              : 5.4;
  const dollyZ = baseZ * aspectScale + pushOffset;
  const dollyY =
    state.screen === 'receipt'
      ? 2.55
      : isResultLike
        ? 2.48
        : state.screen === 'shelf'
          ? 1.92
          : portrait
            ? 1.65
            : 1.72;
  const camAlpha = snap ? 1 : 0.08;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * 0.32, camAlpha);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, dollyY + pointerY * 0.16, camAlpha);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, dollyZ, camAlpha);
  const lookY = isResultLike ? (portrait ? 0.85 : 1.56) : state.screen === 'shelf' ? 0.22 : state.screen === 'fairfight' ? 0.78 : 0.48;
  camera.lookAt(state.screen === 'attract' && !portrait ? 0.35 : 0, lookY, 0);
}
