import * as THREE from 'three';
import concreteColorUrl from '../assets/textures/concrete-color.webp';
import concreteNormalUrl from '../assets/textures/concrete-normal.webp';
import concreteRoughnessUrl from '../assets/textures/concrete-roughness.webp';
import metalNormalUrl from '../assets/textures/metal-normal.webp';
import metalRoughnessUrl from '../assets/textures/metal-roughness.webp';

export type ScreenMode =
  | 'attract'
  | 'battery-fail'
  | 'wifi-fail'
  | 'creator-fail'
  | 'private-fail'
  | 'dead'
  | 'studio';

export interface ShowroomTextures {
  concreteColor: THREE.Texture;
  concreteNormal: THREE.Texture;
  concreteRoughness: THREE.Texture;
  metalNormal: THREE.Texture;
  metalRoughness: THREE.Texture;
  dispose(): void;
}

function loadRepeatTex(
  loader: THREE.TextureLoader,
  url: string,
  repeat: number,
  colorSpace: THREE.ColorSpace,
): THREE.Texture {
  const tex = loader.load(url);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = colorSpace;
  return tex;
}

export function loadShowroomTextures(): ShowroomTextures {
  const loader = new THREE.TextureLoader();
  const concreteColor = loadRepeatTex(loader, concreteColorUrl, 4, THREE.SRGBColorSpace);
  const concreteNormal = loadRepeatTex(loader, concreteNormalUrl, 4, THREE.NoColorSpace);
  const concreteRoughness = loadRepeatTex(loader, concreteRoughnessUrl, 4, THREE.NoColorSpace);
  const metalNormal = loadRepeatTex(loader, metalNormalUrl, 2, THREE.NoColorSpace);
  const metalRoughness = loadRepeatTex(loader, metalRoughnessUrl, 2, THREE.NoColorSpace);

  return {
    concreteColor,
    concreteNormal,
    concreteRoughness,
    metalNormal,
    metalRoughness,
    dispose(): void {
      concreteColor.dispose();
      concreteNormal.dispose();
      concreteRoughness.dispose();
      metalNormal.dispose();
      metalRoughness.dispose();
    },
  };
}

function drawScreenBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accentHex: string,
  decay: number,
): void {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, decay > 0.5 ? '#202624' : '#0B1222');
  grad.addColorStop(1, decay > 0.5 ? '#353C38' : accentHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(24, 24, w - 48, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(24, 72, w * 0.45, h - 108);
  ctx.fillRect(40 + w * 0.45, 72, w * 0.55 - 64, h - 108);
}

function drawFailureOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, mode: ScreenMode): void {
  if (mode === 'battery-fail' || mode === 'dead') {
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#E4262B';
    ctx.lineWidth = 6;
    ctx.strokeRect(w * 0.38, h * 0.36, w * 0.2, h * 0.28);
    ctx.fillStyle = '#E4262B';
    ctx.fillRect(w * 0.58, h * 0.44, 10, h * 0.12);
    ctx.fillRect(w * 0.4, h * 0.39, 18, h * 0.22);
    return;
  }

  ctx.fillStyle = 'rgba(11, 12, 14, 0.78)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#E4262B';
  ctx.fillRect(48, h * 0.38, w - 96, 68);
  ctx.fillStyle = '#FFF3E0';
  ctx.font = '700 28px sans-serif';
  ctx.textAlign = 'center';
  const msg =
    mode === 'wifi-fail'
      ? 'NO WI-FI SIGNAL'
      : mode === 'creator-fail'
        ? 'FRAME DROP / STALL'
        : 'UPLOADING DATA...';
  ctx.fillText(msg, w / 2, h * 0.38 + 44);
}

function drawDecayStreaks(ctx: CanvasRenderingContext2D, w: number, h: number, decay: number): void {
  if (decay < 0.35) return;
  ctx.fillStyle = `rgba(126, 138, 131, ${Math.min(0.45, decay * 0.42)})`;
  ctx.fillRect(0, 0, w, h);
  if (decay >= 0.65) {
    ctx.fillStyle = 'rgba(228, 38, 43, 0.72)';
    ctx.fillRect(w * 0.18, 0, 3, h);
    ctx.fillRect(w * 0.73, h * 0.15, 2, h * 0.85);
  }
}

export function createScreenSurface(accentHex: string): {
  texture: THREE.CanvasTexture;
  redraw: (mode: ScreenMode, decay: number) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  let lastKey = '';

  const redraw = (mode: ScreenMode, decay: number): void => {
    const quantized = Math.round(decay * 10);
    const nextKey = `${mode}:${quantized}`;
    if (nextKey === lastKey || !ctx) return;
    lastKey = nextKey;

    if (mode === 'studio') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#EEF3FA');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0B63F6';
      ctx.fillRect(36, 48, canvas.width - 72, 10);
      ctx.fillStyle = 'rgba(11, 99, 246, 0.14)';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.5, canvas.height * 0.56, 72, 0, Math.PI * 2);
      ctx.fill();
    } else if (mode === 'attract') {
      drawScreenBase(ctx, canvas.width, canvas.height, accentHex, decay);
      drawDecayStreaks(ctx, canvas.width, canvas.height, decay);
    } else {
      drawScreenBase(ctx, canvas.width, canvas.height, accentHex, decay);
      drawFailureOverlay(ctx, canvas.width, canvas.height, mode);
      drawDecayStreaks(ctx, canvas.width, canvas.height, decay);
    }
    texture.needsUpdate = true;
  };

  redraw('attract', 0);
  return { texture, redraw };
}
