import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createShowroomLights } from './lights';
import { createDustMotes } from './particles';
import { createAdaptiveQuality, type QualityState } from './quality';
import { createShowroomModels, type StageState } from './scenes3d';
import { loadShowroomTextures } from './textures';

export interface StageWindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stage3DController {
  sync(next: StageState): void;
  setStageWindow(rect: StageWindowRect | null): void;
  getQuality(): QualityState;
  dispose(): void;
}

function isSoftwareGpu(renderer: THREE.WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return false;
    const raw = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '').toLowerCase();
    return /swiftshader|llvmpipe|software|mesa|basic render/.test(raw);
  } catch {
    return false;
  }
}

function computeSoftDpr(): number {
  const maxSide = Math.max(window.innerWidth, window.innerHeight, 1);
  return Math.max(0.42, Math.min(1, 800 / maxSide));
}

export function createWebGLStage(
  canvas: HTMLCanvasElement,
  initialState: StageState,
  onContextLost: () => void,
): Stage3DController {
  const automated = typeof navigator !== 'undefined' && navigator.webdriver === true;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !automated,
    powerPreference: automated ? 'low-power' : 'high-performance',
  });
  const softGpu = isSoftwareGpu(renderer);
  const initialDpr = softGpu ? computeSoftDpr() : window.devicePixelRatio || 1;
  const quality = createAdaptiveQuality(initialDpr);
  renderer.setPixelRatio(initialDpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    42,
    Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight)),
    0.1,
    60,
  );
  camera.position.set(0, 1.72, 5.6);

  let pmrem: THREE.PMREMGenerator | null = null;
  let envTex: THREE.Texture | null = null;
  if (!softGpu) {
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
  }

  const textures = loadShowroomTextures(softGpu);
  const lights = createShowroomLights(scene, softGpu);
  const particles = createDustMotes(scene);
  const models = createShowroomModels(scene, textures, softGpu);

  let state: StageState = { ...initialState };
  let pointerX = 0;
  let pointerY = 0;
  let rafId = 0;
  let lastMs = performance.now();
  const startMs = lastMs;
  let lastPointerRenderMs = -500;
  let dirty = true;
  let disposed = false;
  let targetOffX = 0;
  let targetOffY = 0;
  let curOffX = 0;
  let curOffY = 0;

  const applyViewOffset = (dtMs: number): void => {
    const W = Math.max(1, window.innerWidth);
    const H = Math.max(1, window.innerHeight);
    if (softGpu) {
      curOffX = targetOffX;
      curOffY = targetOffY;
    } else {
      const k = 1 - Math.exp(-dtMs / 130);
      curOffX += (targetOffX - curOffX) * k;
      curOffY += (targetOffY - curOffY) * k;
    }
    if (Math.abs(curOffX) > 0.5 || Math.abs(curOffY) > 0.5) {
      camera.setViewOffset(W, H, curOffX, curOffY, W, H);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  };

  const renderFrame = (nowMs: number): void => {
    const dtMs = Math.max(1, Math.min(100, nowMs - lastMs));
    lastMs = nowMs;
    const dtSec = dtMs / 1000;
    const tSec = (nowMs - startMs) / 1000;
    const q = quality.recordFrame(dtMs);
    if (q.degraded && !softGpu && renderer.getPixelRatio() > 1) {
      renderer.setPixelRatio(1);
    }
    const isClear =
      state.screen === 'fairfight' || state.screen === 'result' || state.screen === 'staff';
    const isFlip = state.screen === 'flip1' || state.screen === 'flip2' || state.screen === 'flip3';
    const isPlinth = state.screen === 'attract' || state.screen === 'shelf';
    lights.update({
      tSec,
      decay: state.decay,
      isClear,
      persona: state.persona,
      isFlip: isFlip || state.buyFlash,
      isPlinth,
    });
    particles.update(dtSec, state.decay, q.degraded || softGpu, !isClear);
    applyViewOffset(dtMs);
    models.update({ state, tSec, dtSec, pointerX, pointerY, camera, snap: softGpu });
    renderer.render(scene, camera);
  };

  const scheduleSoftFrame = (): void => {
    if (disposed || rafId !== 0) return;
    rafId = window.requestAnimationFrame((nowMs: number) => {
      rafId = 0;
      if (disposed) return;
      dirty = false;
      renderFrame(nowMs);
    });
  };

  const tick = (nowMs: number): void => {
    if (disposed) return;
    const minInterval = quality.getState().degraded ? 45 : 16;
    if (dirty || nowMs - lastPointerRenderMs >= minInterval) {
      dirty = false;
      renderFrame(nowMs);
      lastPointerRenderMs = nowMs;
    }
    rafId = window.requestAnimationFrame(tick);
  };

  const onResize = (): void => {
    camera.aspect = Math.max(0.5, window.innerWidth / Math.max(1, window.innerHeight));
    camera.updateProjectionMatrix();
    if (softGpu) renderer.setPixelRatio(computeSoftDpr());
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    dirty = true;
    if (softGpu) scheduleSoftFrame();
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

  if (softGpu) {
    scheduleSoftFrame();
  } else {
    rafId = window.requestAnimationFrame(tick);
  }

  return {
    sync(next: StageState): void {
      state = { ...next };
      dirty = true;
      if (softGpu) scheduleSoftFrame();
    },
    setStageWindow(rect: StageWindowRect | null): void {
      const W = Math.max(1, window.innerWidth);
      const H = Math.max(1, window.innerHeight);
      if (rect && rect.width > 0 && rect.height > 0) {
        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;
        targetOffX = W / 2 - cx;
        targetOffY = H / 2 - cy;
      } else {
        targetOffX = 0;
        targetOffY = 0;
      }
      dirty = true;
      if (softGpu) scheduleSoftFrame();
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
      envTex?.dispose();
      pmrem?.dispose();
      renderer.dispose();
    },
  };
}
