import * as THREE from 'three';
import type { Persona } from '../core/types';

export interface ShowroomLights {
  update(opts: {
    tSec: number;
    decay: number;
    isClear: boolean;
    persona: Persona | null;
    isFlip: boolean;
    isPlinth: boolean;
  }): void;
  dispose(): void;
}

const PERSONA_RIM: Record<Persona, number> = {
  study: 0x0b63f6,
  create: 0xff6fa5,
  game: 0x66e0be,
  hustle: 0xb9a7ff,
};

const C_BG_DARK = new THREE.Color(0x0b0c0e);
const C_DUST = new THREE.Color(0x7e8a83);
const C_WARM = new THREE.Color(0xfff3e0);
const C_NEON = new THREE.Color(0xff2b33);
const C_RIM_DARK = new THREE.Color(0xff4d6d);
const C_CLEAR_BG = new THREE.Color(0xeef3fa);
const C_WORK = new THREE.Color();

function createStudioEnvTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const c = canvas.getContext('2d');
  if (!c) return null;
  const g = c.createLinearGradient(0, 0, 0, 32);
  g.addColorStop(0, '#eef5ff');
  g.addColorStop(0.45, '#5a6b8a');
  g.addColorStop(0.55, '#1e2230');
  g.addColorStop(1, '#0b0c0e');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 32);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fillRect(10, 4, 18, 5);
  c.fillRect(38, 6, 16, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createShowroomLights(scene: THREE.Scene, softwareFallback = false): ShowroomLights {
  const envFallbackTex = softwareFallback ? createStudioEnvTexture() : null;
  if (envFallbackTex) {
    scene.environment = envFallbackTex;
  }

  const ambient = new THREE.AmbientLight(0xfff3e0, softwareFallback ? 0.85 : 0.35);
  const hemi = new THREE.HemisphereLight(0xfff3e0, 0x17191d, softwareFallback ? 0.85 : 0.28);
  const keySpot = softwareFallback
    ? new THREE.DirectionalLight(0xfff3e0, 1.45)
    : new THREE.SpotLight(0xfff3e0, 28, 22, Math.PI / 4, 0.55, 1.4);
  keySpot.position.set(1.8, 5.4, 4.6);
  if (!softwareFallback) {
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.set(1024, 1024);
    keySpot.shadow.bias = -0.0005;
  }

  const fillSpot = softwareFallback
    ? new THREE.DirectionalLight(0xbcd7ff, 0.62)
    : new THREE.SpotLight(0xfff3e0, 16, 20, Math.PI / 3, 0.65, 1.5);
  fillSpot.position.set(-4.2, 4.1, 3.8);

  const neonLight = new THREE.PointLight(0xe4262b, 9.5, 14, 1.4);
  neonLight.position.set(0, 2.5, -3.2);

  const rimLight = softwareFallback
    ? new THREE.DirectionalLight(0xff4d6d, 1.25)
    : new THREE.SpotLight(0xff4d6d, 18, 18, Math.PI / 2.6, 0.45, 1.1);
  rimLight.position.set(0, 2.6, -4.1);

  const neonGeo = new THREE.BoxGeometry(8.6, 0.035, 0.05);
  const neonMat = new THREE.MeshBasicMaterial({
    color: 0xff2b33,
  });
  const neonTube = new THREE.Mesh(neonGeo, neonMat);
  neonTube.position.set(0, 0.01, -1.52);

  scene.add(ambient, hemi, keySpot, fillSpot, rimLight, neonLight, neonTube);

  return {
    update({ tSec, decay, isClear, persona, isFlip, isPlinth }): void {
      const d = Math.max(0, Math.min(1, decay));
      const spotScale = softwareFallback ? 0.06 : 1;
      if (isClear) {
        scene.background = C_CLEAR_BG;
        if (!scene.fog || scene.fog.color.getHex() !== 0xeef3fa) {
          scene.fog = new THREE.FogExp2(0xeef3fa, 0.015);
        }
        ambient.color.setHex(0xffffff);
        ambient.intensity = softwareFallback ? 1.5 : 1.15;
        hemi.color.setHex(0xffffff);
        hemi.groundColor.setHex(0xd6e1f2);
        keySpot.color.setHex(0xffffff);
        keySpot.intensity = 30 * spotScale;
        fillSpot.intensity = softwareFallback ? 0.72 : 18;
        neonLight.intensity = 0;
        neonTube.visible = false;
        rimLight.color.setHex(persona ? PERSONA_RIM[persona] : 0x0b63f6);
        rimLight.intensity = softwareFallback ? 1.15 : 22;
        return;
      }

      C_WORK.copy(C_BG_DARK).lerp(C_DUST, d * 0.28);
      scene.background = C_WORK;
      if (!scene.fog) {
        scene.fog = new THREE.FogExp2(C_WORK.getHex(), 0.045 + d * 0.055);
      } else {
        scene.fog.color.copy(C_WORK);
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.density = 0.045 + d * 0.055;
        }
      }
      neonTube.visible = isPlinth && !isFlip;

      const sweep = isFlip ? 0.35 + 0.65 * Math.cos(tSec * 2.4) : 1;
      const flicker =
        d > 0.35 ? 0.72 + 0.28 * Math.sin(tSec * 19) * Math.cos(tSec * 7) : 0.94 + 0.06 * Math.sin(tSec * 5.2);

      ambient.color.copy(C_WARM).lerp(C_DUST, d * 0.75);
      ambient.intensity = (softwareFallback ? 0.75 : 0.35 + d * 0.15) * sweep;
      hemi.color.copy(C_WARM).lerp(C_DUST, d * 0.65);
      keySpot.color.copy(C_WARM).lerp(C_DUST, d * 0.6);
      keySpot.intensity = 28 * spotScale * (1 - d * 0.58) * sweep;
      fillSpot.intensity = (softwareFallback ? 0.62 : 16) * (1 - d * 0.5) * sweep;
      neonLight.intensity = 9.5 * (1 - d * 0.75) * flicker;
      neonMat.color.copy(C_NEON).lerp(C_DUST, d * 0.65);
      rimLight.color.copy(persona ? new THREE.Color(PERSONA_RIM[persona]) : C_RIM_DARK);
      rimLight.intensity = (softwareFallback ? 1.25 : 16) * (1 - d * 0.45);
    },
    dispose(): void {
      neonGeo.dispose();
      neonMat.dispose();
      envFallbackTex?.dispose();
    },
  };
}
