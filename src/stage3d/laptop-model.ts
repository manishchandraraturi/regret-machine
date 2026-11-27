import * as THREE from 'three';
import { createScreenSurface, type ScreenMode, type ShowroomTextures } from './textures';

export interface LaptopRig {
  group: THREE.Group;
  setDecay(decay: number): void;
  setScreenMode(mode: ScreenMode, decay: number, flashBoost?: number): void;
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
    curveSegments: 8,
    steps: 1,
    bevelSize: 0.016,
    bevelThickness: 0.014,
  });
  geom.rotateX(Math.PI / 2);
  return geom;
}

interface SharedLaptopGeos {
  baseGeo: THREE.ExtrudeGeometry;
  keyGeo: THREE.BoxGeometry;
  trackpadGeo: THREE.BoxGeometry;
  hingeGeo: THREE.CylinderGeometry;
  lidBackGeo: THREE.ExtrudeGeometry;
  bezelGeo: THREE.PlaneGeometry;
  screenGeo: THREE.PlaneGeometry;
  rimGeo: THREE.RingGeometry;
}

let cachedGeos: SharedLaptopGeos | null = null;

function getSharedGeos(): SharedLaptopGeos {
  if (cachedGeos) return cachedGeos;
  const lidBackGeo = createRoundedSlab(2.05, 1.32, 0.032, 0.08);
  lidBackGeo.rotateX(Math.PI / 2);
  const hingeGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.48, 12);
  hingeGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.RingGeometry(0.95, 1.28, 24);
  rimGeo.rotateX(-Math.PI / 2);
  cachedGeos = {
    baseGeo: createRoundedSlab(2.05, 1.38, 0.075, 0.08),
    keyGeo: new THREE.BoxGeometry(0.11, 0.02, 0.09),
    trackpadGeo: new THREE.BoxGeometry(0.62, 0.008, 0.36),
    hingeGeo,
    lidBackGeo,
    bezelGeo: new THREE.PlaneGeometry(1.94, 1.2),
    screenGeo: new THREE.PlaneGeometry(1.82, 1.1),
    rimGeo,
  };
  return cachedGeos;
}

function buildInstancedKeys(keyGeo: THREE.BoxGeometry, keyMat: THREE.Material): THREE.InstancedMesh {
  const cols = 13;
  const rows = 4;
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

interface LaptopMaterials {
  chassisMat: THREE.MeshStandardMaterial | THREE.MeshPhongMaterial;
  bezelMat: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;
  keyMat: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;
  trackpadMat: THREE.MeshStandardMaterial | THREE.MeshPhongMaterial | THREE.MeshLambertMaterial;
  screenMat: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
}

function createLaptopMaterials(
  baseColor: THREE.Color,
  textures: ShowroomTextures,
  lowCost: boolean,
): LaptopMaterials {
  if (lowCost) {
    return {
      chassisMat: new THREE.MeshPhongMaterial({
        color: baseColor.clone(),
        specular: 0xdce6f5,
        shininess: 86,
        reflectivity: 0.34,
      }),
      bezelMat: new THREE.MeshLambertMaterial({ color: 0x0b0c0e }),
      keyMat: new THREE.MeshLambertMaterial({ color: 0x17191d }),
      trackpadMat: new THREE.MeshPhongMaterial({
        color: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.16),
        specular: 0xe2e8f0,
        shininess: 72,
      }),
      screenMat: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    };
  }
  return {
    chassisMat: new THREE.MeshStandardMaterial({
      color: baseColor.clone(),
      metalness: 0.88,
      roughness: 0.20,
      envMapIntensity: 1.5,
      normalMap: textures.metalNormal,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: textures.metalRoughness,
    }),
    bezelMat: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.28, metalness: 0.35, envMapIntensity: 1.2 }),
    keyMat: new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.55, metalness: 0.15 }),
    trackpadMat: new THREE.MeshStandardMaterial({
      color: baseColor.clone().lerp(new THREE.Color('#ffffff'), 0.16),
      metalness: 0.68,
      roughness: 0.16,
      envMapIntensity: 1.35,
    }),
    screenMat: new THREE.MeshStandardMaterial({
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.78,
      roughness: 0.14,
      metalness: 0.08,
    }),
  };
}

export function buildLaptopRig(
  bodyHex: string,
  textures: ShowroomTextures,
  lowCost = false,
): LaptopRig {
  const root = new THREE.Group();
  const baseColor = new THREE.Color(bodyHex);
  const dustColor = new THREE.Color('#7E8A83');
  const { chassisMat, bezelMat, keyMat, trackpadMat, screenMat } = createLaptopMaterials(
    baseColor,
    textures,
    lowCost,
  );

  const geos = getSharedGeos();
  const baseMesh = new THREE.Mesh(geos.baseGeo, chassisMat);
  baseMesh.position.y = 0.05;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;

  const keys = buildInstancedKeys(geos.keyGeo, keyMat);
  const trackpad = new THREE.Mesh(geos.trackpadGeo, trackpadMat);
  trackpad.position.set(0, 0.062, 0.36);

  const hinge = new THREE.Mesh(geos.hingeGeo, bezelMat);
  hinge.position.set(0, 0.068, -0.66);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.068, -0.66);
  lidPivot.rotation.x = -0.26;

  const lidBack = new THREE.Mesh(geos.lidBackGeo, chassisMat);
  lidBack.position.set(0, 0.68, -0.02);
  lidBack.castShadow = true;

  const bezel = new THREE.Mesh(geos.bezelGeo, bezelMat);
  bezel.position.set(0, 0.68, 0.004);

  const screenSurface = createScreenSurface(bodyHex);
  screenMat.map = screenSurface.texture;
  if ('emissiveMap' in screenMat) {
    screenMat.emissiveMap = screenSurface.texture;
  }
  const screenMesh = new THREE.Mesh(geos.screenGeo, screenMat);
  screenMesh.position.set(0, 0.68, 0.008);

  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x0b63f6,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const rimMesh = new THREE.Mesh(geos.rimGeo, rimMat);
  rimMesh.position.set(0, -0.01, 0);

  lidPivot.add(lidBack, bezel, screenMesh);
  root.add(baseMesh, keys, trackpad, hinge, lidPivot, rimMesh);

  let currentMode: ScreenMode = 'attract';

  const setDecay = (decay: number): void => {
    const d = Math.max(0, Math.min(1, decay));
    chassisMat.color.copy(baseColor).lerp(dustColor, d * 0.65);
    if ('roughness' in chassisMat) {
      chassisMat.roughness = 0.28 + d * 0.56;
      chassisMat.normalScale.set(0.25 + d * 0.85, 0.25 + d * 0.85);
    } else {
      chassisMat.shininess = Math.max(6, 46 - d * 36);
    }
    if ('emissiveIntensity' in screenMat) {
      screenMat.emissiveIntensity = Math.max(0.15, 0.72 - d * 0.48);
    }
    screenSurface.redraw(currentMode, d);
  };

  return {
    group: root,
    setDecay,
    setScreenMode(mode: ScreenMode, decay: number, flashBoost = 0): void {
      currentMode = mode;
      screenSurface.redraw(mode, decay);
      if ('emissiveIntensity' in screenMat) {
        const base = Math.max(0.22, 0.78 - decay * 0.45);
        screenMat.emissiveIntensity = base + flashBoost;
      }
    },
    setHighlight(hovered: boolean, selected: boolean): void {
      rimMat.opacity = selected ? 0.85 : hovered ? 0.45 : 0;
      rimMat.color.setHex(selected ? 0x0b63f6 : 0xfff3e0);
    },
    dispose(): void {
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
