import * as THREE from 'three';

export interface DustMotes {
  update(dtSec: number, decay: number, degraded: boolean, visible: boolean): void;
  dispose(): void;
}

const TOTAL_COUNT = 220;

export function createDustMotes(scene: THREE.Scene): DustMotes {
  const positions = new Float32Array(TOTAL_COUNT * 3);
  const speeds = new Float32Array(TOTAL_COUNT);

  for (let i = 0; i < TOTAL_COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 4.5 - 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 0.8;
    speeds[i] = 0.08 + Math.random() * 0.18;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xfff3e0,
    size: 0.045,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return {
    update(dtSec: number, decay: number, degraded: boolean, visible: boolean): void {
      points.visible = visible;
      if (!visible) return;
      const limit = degraded ? Math.floor(TOTAL_COUNT / 2) : TOTAL_COUNT;
      geo.setDrawRange(0, limit);
      const d = Math.max(0, Math.min(1, decay));
      mat.opacity = 0.22 + d * 0.52;
      mat.color.setHex(0xfff3e0).lerp(new THREE.Color(0x7e8a83), d * 0.7);

      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < limit; i += 1) {
        let y = arr[i * 3 + 1] + speeds[i] * dtSec * (0.6 + d * 0.8);
        if (y > 4.2) y = -0.4;
        arr[i * 3 + 1] = y;
      }
      posAttr.needsUpdate = true;
    },
    dispose(): void {
      geo.dispose();
      mat.dispose();
    },
  };
}
