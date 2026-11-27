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

export function createShowroomLights(scene: THREE.Scene, softwareFallback = false): ShowroomLights {
  const ambient = new THREE.AmbientLight(0xfff3e0, softwareFallback ? 0.9 : 0.35);
  const hemi = new THREE.HemisphereLight(0xfff3e0, 0x17191d, softwareFallback ? 0.9 : 0.25);
  const keySpot = softwareFallback
    ? new THREE.DirectionalLight(0xfff3e0, 1.45)
    : new THREE.SpotLight(0xfff3e0, 26, 22, Math.PI / 4, 0.55, 1.4);
  keySpot.position.set(1.8, 5.4, 4.6);

  const fillSpot = softwareFallback
    ? new THREE.DirectionalLight(0xfff3e0, 0.75)
    : new THREE.SpotLight(0xfff3e0, 14, 20, Math.PI / 3, 0.65, 1.5);
  fillSpot.position.set(-4.2, 4.1, 3.8);

  const neonLight = new THREE.PointLight(0xe4262b, 8.5, 14, 1.4);
  neonLight.position.set(0, 2.5, -3.2);

  const rimLight = softwareFallback
    ? new THREE.DirectionalLight(0x0b63f6, 0.85)
    : new THREE.SpotLight(0x0b63f6, 10, 16, Math.PI / 3, 0.5, 1.2);
  rimLight.position.set(0, 2.8, -3.8);

  const neonGeo = new THREE.BoxGeometry(8.6, 0.035, 0.05);
  const neonMat = new THREE.MeshBasicMaterial({
    color: 0xff2b33,
  });
  const neonTube = new THREE.Mesh(neonGeo, neonMat);
  neonTube.position.set(0, 0.01, -1.52);

  scene.add(ambient, hemi, keySpot, neonLight, neonTube);
  if (!softwareFallback) {
    scene.add(fillSpot, rimLight);
  }

  return {
    update({ tSec, decay, isClear, persona, isFlip, isPlinth }): void {
      const d = Math.max(0, Math.min(1, decay));
      const spotScale = softwareFallback ? 0.06 : 1;
      if (isClear) {
        scene.background = new THREE.Color(0xeef3fa);
        scene.fog = new THREE.FogExp2(0xeef3fa, 0.015);
        ambient.color.setHex(0xffffff);
        ambient.intensity = softwareFallback ? 1.5 : 1.15;
        hemi.color.setHex(0xffffff);
        hemi.groundColor.setHex(0xd6e1f2);
        keySpot.color.setHex(0xffffff);
        keySpot.intensity = 30 * spotScale;
        fillSpot.intensity = 18 * spotScale;
        neonLight.intensity = 0;
        neonTube.visible = false;
        rimLight.color.setHex(persona ? PERSONA_RIM[persona] : 0x0b63f6);
        rimLight.intensity = 18 * spotScale;
        return;
      }

      const bgCol = new THREE.Color(0x0b0c0e).lerp(new THREE.Color(0x7e8a83), d * 0.28);
      scene.background = bgCol;
      scene.fog = new THREE.FogExp2(bgCol.getHex(), 0.045 + d * 0.055);
      neonTube.visible = isPlinth && !isFlip;

      const sweep = isFlip ? 0.35 + 0.65 * Math.cos(tSec * 2.4) : 1;
      const flicker =
        d > 0.35 ? 0.72 + 0.28 * Math.sin(tSec * 19) * Math.cos(tSec * 7) : 0.94 + 0.06 * Math.sin(tSec * 5.2);

      ambient.color.setHex(0xfff3e0).lerp(new THREE.Color(0x7e8a83), d * 0.75);
      ambient.intensity = (softwareFallback ? 0.75 : 0.35 + d * 0.15) * sweep;
      hemi.color.setHex(0xfff3e0).lerp(new THREE.Color(0x7e8a83), d * 0.65);
      keySpot.color.setHex(0xfff3e0).lerp(new THREE.Color(0x7e8a83), d * 0.6);
      keySpot.intensity = 26 * spotScale * (1 - d * 0.58) * sweep;
      fillSpot.intensity = 14 * spotScale * (1 - d * 0.5) * sweep;
      neonLight.intensity = 8.5 * (1 - d * 0.75) * flicker;
      neonMat.color.setHex(0xff2b33).lerp(new THREE.Color(0x7e8a83), d * 0.65);
      rimLight.intensity = 4 * spotScale;
    },
    dispose(): void {
      neonGeo.dispose();
      neonMat.dispose();
    },
  };
}
