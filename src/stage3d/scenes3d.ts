import * as THREE from 'three';
import type { Persona, ScreenId } from '../core/types';
import { buildLaptopRig, type LaptopRig } from './laptop-model';
import type { ScreenMode, ShowroomTextures } from './textures';

export interface StageState {
  screen: ScreenId;
  decay: number;
  persona: Persona | null;
  laptopId: string | null;
  hoveredLaptopId: string | null;
  scenePhase: 'PLAY' | 'FAIL' | 'REVEAL';
  sceneAlert: boolean;
}

export interface ShowroomModels {
  update(opts: { state: StageState; tSec: number; dtSec: number; pointerX: number; pointerY: number; camera: THREE.PerspectiveCamera }): void;
  dispose(): void;
}

const SHELF_IDS = ['lap-zesta', 'lap-voltra', 'lap-nimbus'] as const;
const SHELF_COLORS = ['#FF6FA5', '#66E0BE', '#B9A7FF'] as const;

function resolveFailMode(screen: ScreenId, phase: string, alert: boolean): ScreenMode {
  if (phase === 'PLAY' && !alert) return 'attract';
  if (screen === 'battery') return 'battery-fail';
  if (screen === 'lecture') return 'wifi-fail';
  if (screen === 'creator') return 'creator-fail';
  if (screen === 'private') return 'private-fail';
  return 'dead';
}

function buildFloorMesh(textures: ShowroomTextures): {
  floor: THREE.Mesh;
  floorMat: THREE.MeshStandardMaterial;
  plinth: THREE.Mesh;
  plinthMat: THREE.MeshStandardMaterial;
} {
  const floorGeo = new THREE.PlaneGeometry(34, 24);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x17191d,
    map: textures.concreteColor,
    normalMap: textures.concreteNormal,
    roughnessMap: textures.concreteRoughness,
    roughness: 0.48,
    metalness: 0.12,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;

  const plinthGeo = new THREE.BoxGeometry(9.2, 0.36, 2.4);
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0x1a1d22,
    roughness: 0.32,
    metalness: 0.4,
    normalMap: textures.concreteNormal,
    normalScale: new THREE.Vector2(0.25, 0.25),
  });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, -0.2, -0.1);
  return { floor, floorMat, plinth, plinthMat };
}

function positionShelfLaptops(rigs: LaptopRig[], state: StageState, tSec: number, yTarget: number): void {
  const isAttract = state.screen === 'attract';
  rigs.forEach((rig, idx) => {
    const id = SHELF_IDS[idx];
    const selected = state.laptopId === id;
    const hovered = state.hoveredLaptopId === id;
    const tx = isAttract ? 1.45 + idx * 1.45 : (idx - 1) * 2.35;
    const tz = isAttract ? -0.35 * idx : selected ? 0.65 : 0;
    const lift = hovered ? 0.18 : selected ? 0.08 : 0;

    rig.group.visible = true;
    rig.group.position.x = THREE.MathUtils.lerp(rig.group.position.x, tx, 0.12);
    rig.group.position.y = THREE.MathUtils.lerp(rig.group.position.y, yTarget + lift, 0.12);
    rig.group.position.z = THREE.MathUtils.lerp(rig.group.position.z, tz, 0.12);

    const baseRot = isAttract ? -0.28 + Math.sin(tSec * 0.8 + idx) * 0.08 : hovered ? Math.sin(tSec * 2.2) * 0.16 : 0;
    rig.group.rotation.y = THREE.MathUtils.lerp(rig.group.rotation.y, baseRot, 0.12);
    rig.group.rotation.x = 0;
    rig.setDecay(0);
    rig.setScreenMode('attract', 0);
    rig.setHighlight(hovered, selected);
  });
}

function positionSingleAndReveal(
  rigs: LaptopRig[],
  studioRig: LaptopRig,
  state: StageState,
  tSec: number,
  dtSec: number,
): void {
  const selectedIdx = Math.max(0, SHELF_IDS.indexOf((state.laptopId ?? 'lap-zesta') as (typeof SHELF_IDS)[number]));
  const activeRig = rigs[selectedIdx];
  const screen = state.screen;
  const isStudioScreen = screen === 'fairfight' || screen === 'result' || screen === 'staff';
  const isReveal = (screen === 'lecture' || screen === 'battery' || screen === 'creator' || screen === 'private') && state.scenePhase === 'REVEAL';

  rigs.forEach((r, i) => {
    r.group.visible = !isStudioScreen && i === selectedIdx;
    r.setHighlight(false, false);
  });

  if (isStudioScreen) {
    studioRig.group.visible = true;
    const tx = screen === 'fairfight' ? 0 : 1.95;
    studioRig.group.position.set(THREE.MathUtils.lerp(studioRig.group.position.x, tx, 0.12), 0.12, screen === 'fairfight' ? -0.9 : 0.25);
    studioRig.group.rotation.y += dtSec * 0.35;
    studioRig.setDecay(0);
    studioRig.setScreenMode('studio', 0);
    return;
  }

  activeRig.setDecay(state.decay);
  if (isReveal) {
    activeRig.group.position.set(-1.65, 0.08, 0.2);
    activeRig.group.rotation.y = 0.22;
    activeRig.setScreenMode(resolveFailMode(screen, 'FAIL', true), state.decay);
    studioRig.group.visible = true;
    studioRig.group.position.set(1.65, 0.08, 0.2);
    studioRig.group.rotation.y = -0.22 + Math.sin(tSec * 0.7) * 0.08;
    studioRig.setDecay(0);
    studioRig.setScreenMode('studio', 0);
    return;
  }

  studioRig.group.visible = false;
  const stutter = screen === 'creator' && state.sceneAlert ? Math.sin(tSec * 46) * 0.035 : 0;
  if (screen === 'receipt') {
    activeRig.group.position.set(1.3, -0.02, 0.1);
    activeRig.group.rotation.y = -0.45;
    activeRig.setScreenMode('dead', 1);
  } else {
    activeRig.group.position.set(2.0 + stutter, 0.02, 0.3);
    activeRig.group.rotation.y = -0.35;
    activeRig.setScreenMode(resolveFailMode(screen, state.scenePhase, state.sceneAlert), state.decay);
  }
}

export function createShowroomModels(scene: THREE.Scene, textures: ShowroomTextures): ShowroomModels {
  const { floor, floorMat, plinth, plinthMat } = buildFloorMesh(textures);
  const shelfRigs = SHELF_COLORS.map((hex) => buildLaptopRig(hex, textures));
  const studioRig = buildLaptopRig('#DCE4F0', textures);
  scene.add(floor, plinth, studioRig.group, ...shelfRigs.map((r) => r.group));

  return {
    update({ state, tSec, dtSec, pointerX, pointerY, camera }): void {
      const isClear = state.screen === 'fairfight' || state.screen === 'result' || state.screen === 'staff';
      floorMat.color.setHex(isClear ? 0xeef3fa : 0x17191d);
      floorMat.roughness = isClear ? 0.78 : 0.48;
      plinth.visible = state.screen === 'attract' || state.screen === 'shelf';

      if (state.screen === 'attract' || state.screen === 'shelf') {
        studioRig.group.visible = false;
        positionShelfLaptops(shelfRigs, state, tSec, 0.02);
      } else {
        positionSingleAndReveal(shelfRigs, studioRig, state, tSec, dtSec);
      }

      const dollyZ = state.screen === 'attract' ? 5.6 + Math.sin(tSec * 0.35) * 0.25 : state.screen === 'receipt' ? 4.4 : 5.1;
      const dollyY = state.screen === 'receipt' ? 2.6 : 1.75;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * 0.35, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, dollyY + pointerY * 0.18, 0.08);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, dollyZ, 0.08);
      camera.lookAt(state.screen === 'attract' ? 1.2 : 0, 0.55, 0);
    },
    dispose(): void {
      floor.geometry.dispose();
      floorMat.dispose();
      plinth.geometry.dispose();
      plinthMat.dispose();
      shelfRigs.forEach((r) => r.dispose());
      studioRig.dispose();
    },
  };
}
