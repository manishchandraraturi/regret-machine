import * as THREE from 'three';
import concreteColorUrl from '../assets/textures/concrete-color.webp';
import concreteNormalUrl from '../assets/textures/concrete-normal.webp';
import concreteRoughnessUrl from '../assets/textures/concrete-roughness.webp';
import metalNormalUrl from '../assets/textures/metal-normal.webp';
import metalRoughnessUrl from '../assets/textures/metal-roughness.webp';

export type ScreenMode =
  | 'attract'
  | 'lecture-play'
  | 'battery-play'
  | 'creator-play'
  | 'private-play'
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

export function loadShowroomTextures(lowCost = false): ShowroomTextures {
  const loader = new THREE.TextureLoader();
  const concreteColor = loadRepeatTex(loader, concreteColorUrl, 4, THREE.SRGBColorSpace);
  const concreteNormal = lowCost
    ? concreteColor
    : loadRepeatTex(loader, concreteNormalUrl, 4, THREE.NoColorSpace);
  const concreteRoughness = lowCost
    ? concreteColor
    : loadRepeatTex(loader, concreteRoughnessUrl, 4, THREE.NoColorSpace);
  const metalNormal = lowCost
    ? concreteColor
    : loadRepeatTex(loader, metalNormalUrl, 2, THREE.NoColorSpace);
  const metalRoughness = lowCost
    ? concreteColor
    : loadRepeatTex(loader, metalRoughnessUrl, 2, THREE.NoColorSpace);

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

function drawPlaySceneOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, mode: ScreenMode): boolean {
  const labels: Partial<Record<ScreenMode, { tag: string; color: string }>> = {
    'lecture-play': { tag: 'WI-FI WEAK', color: '#F59E0B' },
    'battery-play': { tag: 'DRAINING FAST', color: '#F59E0B' },
    'creator-play': { tag: 'EXPORTING...', color: '#0B63F6' },
    'private-play': { tag: 'LOCAL LOCK', color: '#22C55E' },
  };
  const cfg = labels[mode];
  if (!cfg) return false;
  ctx.fillStyle = cfg.color;
  ctx.fillRect(54, h * 0.40, w - 108, 48);
  ctx.fillStyle = '#0B0C0E';
  ctx.font = '800 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cfg.tag, w / 2, h * 0.40 + 32);
  return true;
}

function drawFailureOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, mode: ScreenMode): void {
  if (drawPlaySceneOverlay(ctx, w, h, mode)) return;
  if (mode === 'battery-fail' || mode === 'dead') {
    ctx.fillStyle = '#07080A';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#E4262B';
    ctx.lineWidth = 6;
    ctx.strokeRect(w * 0.38, h * 0.28, w * 0.22, h * 0.26);
    ctx.fillStyle = '#E4262B';
    ctx.fillRect(w * 0.60, h * 0.35, 10, h * 0.12);
    ctx.fillRect(w * 0.40, h * 0.31, 18, h * 0.20);
    ctx.font = '800 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mode === 'dead' ? 'BATTERY 0%' : 'LOW BATTERY', w / 2, h * 0.72);
    return;
  }

  ctx.fillStyle = 'rgba(11, 12, 14, 0.82)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#E4262B';
  ctx.fillRect(42, h * 0.36, w - 84, 72);
  ctx.fillStyle = '#FFF3E0';
  ctx.font = '800 28px sans-serif';
  ctx.textAlign = 'center';
  const msg =
    mode === 'wifi-fail'
      ? 'NO WI-FI'
      : mode === 'creator-fail'
        ? 'FRAME DROP'
        : 'CLOUD UPLOAD!';
  ctx.fillText(msg, w / 2, h * 0.36 + 46);
}

function drawDecayStreaks(ctx: CanvasRenderingContext2D, w: number, h: number, decay: number): void {
  if (decay < 0.35) return;
  ctx.fillStyle = `rgba(126, 138, 131, ${Math.min(0.45, decay * 0.42)})`;
  ctx.fillRect(0, 0, w, h);
  if (decay >= 0.65) {
    ctx.fillStyle = 'rgba(228, 38, 43, 0.72)';
    ctx.fillRect(w * 0.18, 0, 3, h);
    ctx.fillRect(w * 0.73, h * 0.15, 2, h * 0.85);
    // One small crack on the 3D laptop screen only
    ctx.strokeStyle = 'rgba(244, 241, 234, 0.82)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.78, 0);
    ctx.lineTo(w * 0.72, h * 0.22);
    ctx.lineTo(w * 0.76, h * 0.36);
    ctx.lineTo(w * 0.66, h * 0.54);
    ctx.stroke();
  }
}

export function createScreenSurface(accentHex: string): {
  texture: THREE.CanvasTexture;
  redraw: (mode: ScreenMode, decay: number) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
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
