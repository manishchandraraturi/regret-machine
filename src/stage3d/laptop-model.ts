import * as THREE from 'three';
import { createScreenSurface, type ScreenMode, type ShowroomTextures } from './textures';

export interface LaptopRig {
  group: THREE.Group;
  setDecay(decay: number): void;
  setScreenMode(mode: ScreenMode, decay: number): void;
  setHighlight(hovered: boolean, selected: boolean): void;
  dispose(): void;
}

function createRoundedSlab(width: number, depth: number, thickness: number, radius: number): THREE.ExtrudeGeometry {
  const hw = width / 2;
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + radius, -hd);
  shape.lineTo(hw - radius, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + radius);
  shape.lineTo(hw, hd - radius);
  shape.quadraticCurveTo(hw, hd, hw - radius, hd);
  shape.lineTo(-hw + radius, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - radius);
  shape.lineTo(-hw, -hd + radius);
  shape.quadraticCurveTo(-hw, -hd, -hw + radius, -hd);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.012,
  });
  geom.rotateX(Math.PI / 2);
  return geom;
}

function buildInstancedKeys(keyMat: THREE.Material): THREE.InstancedMesh {
  const cols = 13;
  const rows = 4;
  const keyGeo = new THREE.BoxGeometry(0.11, 0.02, 0.09);
  const mesh = new THREE.InstancedMesh(keyGeo, keyMat, cols * rows);
  const dummy = new THREE.Object3D();
  let idx = 0;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      dummy.position.set(-0.78 + c * 0.13, 0.068, -0.34 + r * 0.11);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
      idx += 1;
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function buildLaptopRig(bodyHex: string, textures: ShowroomTextures): LaptopRig {
  const root = new THREE.Group();
  const baseColor = new THREE.Color(bodyHex);
  const dustColor = new THREE.Color('#7E8A83');

  const chassisMat = new THREE.MeshStandardMaterial({
    color: baseColor.clone(),
    metalness: 0.78,
    roughness: 0.28,
    normalMap: textures.metalNormal,
    normalScale: new THREE.Vector2(0.25, 0.25),
    roughnessMap: textures.metalRoughness,
  });

  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.35, metalness: 0.2 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.6, metalness: 0.1 });
  const trackpadMat = new THREE.MeshStandardMaterial({
    color: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.14),
    metalness: 0.45,
    roughness: 0.22,
  });

  const baseGeo = createRoundedSlab(2.05, 1.38, 0.075, 0.08);
  const baseMesh = new THREE.Mesh(baseGeo, chassisMat);
  baseMesh.position.y = 0.05;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;

  const keys = buildInstancedKeys(keyMat);
  const trackpadGeo = new THREE.BoxGeometry(0.62, 0.008, 0.36);
  const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
  trackpad.position.set(0, 0.062, 0.36);

  const hingeGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.48, 16);
  hingeGeo.rotateZ(Math.PI / 2);
  const hinge = new THREE.Mesh(hingeGeo, bezelMat);
  hinge.position.set(0, 0.068, -0.66);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.068, -0.66);
  lidPivot.rotation.x = -0.26;

  const lidBackGeo = createRoundedSlab(2.05, 1.32, 0.032, 0.08);
  lidBackGeo.rotateX(Math.PI / 2);
  const lidBack = new THREE.Mesh(lidBackGeo, chassisMat);
  lidBack.position.set(0, 0.68, -0.02);
  lidBack.castShadow = true;

  const bezelGeo = new THREE.PlaneGeometry(1.94, 1.2);
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 0.68, 0.004);

  const screenSurface = createScreenSurface(bodyHex);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenSurface.texture,
    emissiveMap: screenSurface.texture,
    emissive: new THREE.Color('#ffffff'),
    emissiveIntensity: 0.72,
    roughness: 0.18,
    metalness: 0.05,
  });
  const screenGeo = new THREE.PlaneGeometry(1.82, 1.1);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, 0.68, 0.008);

  const rimGeo = new THREE.RingGeometry(0.95, 1.28, 32);
  rimGeo.rotateX(-Math.PI / 2);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x0b63f6,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.set(0, -0.01, 0);

  lidPivot.add(lidBack, bezel, screenMesh);
  root.add(baseMesh, keys, trackpad, hinge, lidPivot, rimMesh);

  let currentMode: ScreenMode = 'attract';

  const setDecay = (decay: number): void => {
    const d = Math.max(0, Math.min(1, decay));
    chassisMat.color.copy(baseColor).lerp(dustColor, d * 0.65);
    chassisMat.roughness = 0.28 + d * 0.56;
    chassisMat.normalScale.set(0.25 + d * 0.85, 0.25 + d * 0.85);
    screenMat.emissiveIntensity = Math.max(0.15, 0.72 - d * 0.48);
    screenSurface.redraw(currentMode, d);
  };

  return {
    group: root,
    setDecay,
    setScreenMode(mode: ScreenMode, decay: number): void {
      currentMode = mode;
      screenSurface.redraw(mode, decay);
    },
    setHighlight(hovered: boolean, selected: boolean): void {
      rimMat.opacity = selected ? 0.85 : hovered ? 0.45 : 0;
      rimMat.color.setHex(selected ? 0x0b63f6 : 0xfff3e0);
    },
    dispose(): void {
      baseGeo.dispose();
      keys.geometry.dispose();
      trackpadGeo.dispose();
      hingeGeo.dispose();
      lidBackGeo.dispose();
      bezelGeo.dispose();
      screenGeo.dispose();
      rimGeo.dispose();
      chassisMat.dispose();
      bezelMat.dispose();
      keyMat.dispose();
      trackpadMat.dispose();
      screenMat.dispose();
      rimMat.dispose();
      screenSurface.texture.dispose();
    },
  };
}
