import * as THREE from 'three';
import type { Persona, ScreenId } from '../core/types';
import { updateCameraPose } from './camera-pose';
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
  buyFlash: boolean;
}

export interface ShowroomModels {
  update(opts: {
    state: StageState;
    tSec: number;
    dtSec: number;
    pointerX: number;
    pointerY: number;
    camera: THREE.PerspectiveCamera;
    snap?: boolean;
  }): void;
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

function buildFloorMesh(
  textures: ShowroomTextures,
  lowCost: boolean,
): {
  floor: THREE.Mesh;
  floorMat: THREE.MeshStandardMaterial | THREE.MeshPhongMaterial;
  studioFloor: THREE.Mesh;
  plinth: THREE.Mesh;
  plinthMat: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;
  studioShadow: THREE.Mesh;
  shadowMat: THREE.MeshBasicMaterial;
} {
  const floorGeo = new THREE.PlaneGeometry(34, 24);
  const floorMat = lowCost
    ? new THREE.MeshPhongMaterial({
        color: 0x3b3f48,
        map: textures.concreteColor,
        specular: 0x452b34,
        shininess: 34,
      })
    : new THREE.MeshStandardMaterial({
        color: 0x17191d,
        map: textures.concreteColor,
        normalMap: textures.concreteNormal,
        roughnessMap: textures.concreteRoughness,
        roughness: 0.48,
        metalness: 0.12,
      });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.03;

  const studioFloorMat = new THREE.MeshBasicMaterial({ color: 0xeef3fa, toneMapped: false });
  const studioFloor = new THREE.Mesh(floorGeo, studioFloorMat);
  studioFloor.rotation.x = -Math.PI / 2;
  studioFloor.position.y = -0.03;
  studioFloor.visible = false;

  const plinthGeo = new THREE.BoxGeometry(11.4, 0.36, 3.6);
  const plinthMat = lowCost
    ? new THREE.MeshLambertMaterial({ color: 0x1a1d22 })
    : new THREE.MeshStandardMaterial({
        color: 0x1a1d22,
        roughness: 0.32,
        metalness: 0.4,
        normalMap: textures.concreteNormal,
        normalScale: new THREE.Vector2(0.25, 0.25),
      });
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.set(0, -0.2, -0.32);

  const shadowGeo = new THREE.CircleGeometry(1.1, 32);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xc2d0e6,
    transparent: true,
    opacity: 0.38,
  });
  const studioShadow = new THREE.Mesh(shadowGeo, shadowMat);
  studioShadow.position.set(1.85, -0.01, 0.2);
  studioShadow.visible = false;

  return { floor, floorMat, studioFloor, plinth, plinthMat, studioShadow, shadowMat };
}

function positionShelfLaptops(
  rigs: LaptopRig[],
  state: StageState,
  tSec: number,
  portrait: boolean,
  snap: boolean,
): void {
  const isAttract = state.screen === 'attract';
  const alpha = snap ? 1 : 0.28;
  rigs.forEach((rig, idx) => {
    const id = SHELF_IDS[idx];
    const selected = state.laptopId === id;
    const hovered = state.hoveredLaptopId === id;
    const tx = isAttract
      ? portrait
        ? (idx - 1) * 1.15
        : (idx - 1) * 1.38
      : portrait
        ? (idx - 1) * 1.45
        : (idx - 1) * 2.68;
    const ty = isAttract ? (portrait ? 0.02 + idx * 0.06 : 0.02 + idx * 0.08) : 0.04;
    const tz = isAttract
      ? portrait
        ? 0.2 - idx * 0.65
        : 0.55 - idx * 0.95
      : selected
        ? 0.52
        : 0;
    const lift = hovered ? 0.2 : selected ? 0.1 : 0;

    rig.group.visible = true;
    rig.group.scale.setScalar(isAttract ? (portrait ? 0.78 : 0.92) : 1);
    rig.group.position.x = THREE.MathUtils.lerp(rig.group.position.x, tx, alpha);
    rig.group.position.y = THREE.MathUtils.lerp(rig.group.position.y, ty + lift, alpha);
    rig.group.position.z = THREE.MathUtils.lerp(rig.group.position.z, tz, alpha);

    const sway = snap ? 0 : Math.sin(tSec * (isAttract ? 0.8 : 2.2) + idx) * (isAttract ? 0.08 : 0.16);
    const baseRot = isAttract ? -0.3 + sway : hovered ? sway : 0;
    rig.group.rotation.y = THREE.MathUtils.lerp(rig.group.rotation.y, baseRot, alpha);
    rig.group.rotation.x = 0;
    rig.setDecay(0);
    rig.setScreenMode('attract', 0);
    rig.setHighlight(hovered, selected);
  });
}

function positionStudioLaptop(
  studioRig: LaptopRig,
  studioShadow: THREE.Mesh,
  screen: ScreenId,
  dtSec: number,
  portrait: boolean,
  snap: boolean,
): void {
  studioRig.group.visible = true;
  studioShadow.visible = true;
  const isFF = screen === 'fairfight';
  const tx = 0;
  const tz = isFF ? 0.15 : 0.3;
  studioRig.group.scale.setScalar(portrait ? 0.68 : isFF ? 0.72 : 0.64);
  studioRig.group.position.set(
    THREE.MathUtils.lerp(studioRig.group.position.x, tx, snap ? 1 : 0.22),
    0,
    tz,
  );
  studioShadow.position.set(studioRig.group.position.x, -0.015, tz);
  studioRig.group.rotation.y = snap ? -0.32 : studioRig.group.rotation.y + dtSec * 0.35;
  studioRig.setDecay(0);
  studioRig.setScreenMode('studio', 0);
}

function positionSingleAndReveal(
  rigs: LaptopRig[],
  studioRig: LaptopRig,
  studioShadow: THREE.Mesh,
  state: StageState,
  tSec: number,
  dtSec: number,
  snap: boolean,
): void {
  const selectedIdx = Math.max(
    0,
    SHELF_IDS.indexOf((state.laptopId ?? 'lap-zesta') as (typeof SHELF_IDS)[number]),
  );
  const activeRig = rigs[selectedIdx];
  const screen = state.screen;
  const isStudioScreen = screen === 'fairfight' || screen === 'result' || screen === 'staff';
  const isReveal =
    (screen === 'lecture' || screen === 'battery' || screen === 'creator' || screen === 'private') &&
    state.scenePhase === 'REVEAL';
  const portrait = typeof window !== 'undefined' && window.innerWidth < 700;

  rigs.forEach((r, i) => {
    r.group.visible = !isStudioScreen && i === selectedIdx;
    r.group.scale.setScalar(portrait ? 0.72 : 1.05);
    r.setHighlight(false, false);
  });

  if (isStudioScreen) {
    positionStudioLaptop(studioRig, studioShadow, screen, dtSec, portrait, snap);
    return;
  }

  activeRig.setDecay(state.decay);
  if (isReveal) {
    const revScale = portrait ? 0.68 : 1.18;
    const revX = portrait ? 0.90 : 1.56;
    activeRig.group.scale.setScalar(revScale);
    activeRig.group.position.set(-revX, 0.02, 0.25);
    activeRig.group.rotation.y = 0.24;
    activeRig.setScreenMode(resolveFailMode(screen, 'FAIL', true), state.decay);
    studioRig.group.visible = true;
    studioShadow.visible = true;
    studioRig.group.scale.setScalar(revScale);
    studioRig.group.position.set(revX, 0.02, 0.25);
    studioShadow.position.set(revX, -0.015, 0.25);
    studioRig.group.rotation.y = -0.24 + (snap ? 0 : Math.sin(tSec * 0.7) * 0.08);
    studioRig.setDecay(0);
    studioRig.setScreenMode('studio', 0);
    return;
  }

  studioRig.group.visible = false;
  studioShadow.visible = false;
  const stutter = screen === 'creator' && state.sceneAlert && !snap ? Math.sin(tSec * 46) * 0.04 : 0;
  if (screen === 'receipt') {
    activeRig.group.position.set(0, 0.0, 0.15);
    activeRig.group.rotation.y = -0.35;
    activeRig.setScreenMode('dead', 1);
  } else {
    activeRig.group.position.set(stutter, 0.0, 0.25);
    activeRig.group.rotation.y = -0.28 + (snap ? 0 : Math.sin(tSec * 0.8) * 0.06);
    activeRig.setScreenMode(resolveFailMode(screen, state.scenePhase, state.sceneAlert), state.decay);
  }
}

export function createShowroomModels(
  scene: THREE.Scene,
  textures: ShowroomTextures,
  lowCost = false,
): ShowroomModels {
  const { floor, floorMat, studioFloor, plinth, plinthMat, studioShadow, shadowMat } = buildFloorMesh(
    textures,
    lowCost,
  );
  const shelfRigs = SHELF_COLORS.map((hex) => buildLaptopRig(hex, textures, lowCost));
  const studioRig = buildLaptopRig('#DCE4F0', textures, lowCost);
  scene.add(floor, studioFloor, plinth, studioShadow, studioRig.group, ...shelfRigs.map((r) => r.group));

  return {
    update({ state, tSec, dtSec, pointerX, pointerY, camera, snap = false }): void {
      const isClear =
        state.screen === 'fairfight' || state.screen === 'result' || state.screen === 'staff';
      const portrait = camera.aspect < 0.85;
      floor.visible = !isClear;
      studioFloor.visible = isClear;
      plinth.visible = state.screen === 'attract' || state.screen === 'shelf';

      if (state.screen === 'attract' || state.screen === 'shelf') {
        studioRig.group.visible = false;
        studioShadow.visible = false;
        positionShelfLaptops(shelfRigs, state, tSec, portrait, snap);
      } else {
        positionSingleAndReveal(shelfRigs, studioRig, studioShadow, state, tSec, dtSec, snap);
      }

      updateCameraPose(camera, state, tSec, pointerX, pointerY, portrait, snap);
    },
    dispose(): void {
      floor.geometry.dispose();
      floorMat.dispose();
      (studioFloor.material as THREE.Material).dispose();
      plinth.geometry.dispose();
      plinthMat.dispose();
      studioShadow.geometry.dispose();
      shadowMat.dispose();
      shelfRigs.forEach((r) => r.dispose());
      studioRig.dispose();
    },
  };
}
