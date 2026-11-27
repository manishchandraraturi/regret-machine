import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createShowroomLights } from './lights';
import { createDustMotes } from './particles';
import { createAdaptiveQuality, type QualityState } from './quality';
import { createShowroomModels, type StageState } from './scenes3d';
import { loadShowroomTextures } from './textures';

export interface Stage3DController {
  sync(next: StageState): void;
  getQuality(): QualityState;
  dispose(): void;
}

export function createWebGLStage(
  canvas: HTMLCanvasElement,
  initialState: StageState,
  onContextLost: () => void,
): Stage3DController {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const quality = createAdaptiveQuality(window.devicePixelRatio || 1);
  renderer.setPixelRatio(quality.getState().pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight)), 0.1, 60);
  camera.position.set(0, 1.8, 5.6);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const textures = loadShowroomTextures();
  const lights = createShowroomLights(scene);
  const particles = createDustMotes(scene);
  const models = createShowroomModels(scene, textures);

  let state: StageState = { ...initialState };
  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;
  let lastMs = performance.now();
  const startMs = lastMs;
  let disposed = false;

  const onResize = (): void => {
    camera.aspect = Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  const onPointerMove = (e: PointerEvent): void => {
    pointerX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    pointerY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
  };

  const handleLost = (ev: Event): void => {
    ev.preventDefault();
    onContextLost();
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('webglcontextlost', handleLost);

  const tick = (nowMs: number): void => {
    if (disposed) return;
    const dtMs = Math.max(1, Math.min(100, nowMs - lastMs));
    lastMs = nowMs;
    const dtSec = dtMs / 1000;
    const tSec = (nowMs - startMs) / 1000;

    const q = quality.recordFrame(dtMs);
    if (q.degraded && renderer.getPixelRatio() !== 1) {
      renderer.setPixelRatio(1);
    }

    const isClear = state.screen === 'fairfight' || state.screen === 'result' || state.screen === 'staff';
    const isFlip = state.screen === 'flip1' || state.screen === 'flip2' || state.screen === 'flip3';
    lights.update({ tSec, decay: state.decay, isClear, persona: state.persona, isFlip });
    particles.update(dtSec, state.decay, q.degraded, !isClear);
    models.update({ state, tSec, dtSec, pointerX, pointerY, camera });

    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(tick);
  };

  rafId = window.requestAnimationFrame(tick);

  return {
    sync(next: StageState): void {
      state = { ...next };
    },
    getQuality(): QualityState {
      return quality.getState();
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', handleLost);
      models.dispose();
      lights.dispose();
      particles.dispose();
      textures.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
