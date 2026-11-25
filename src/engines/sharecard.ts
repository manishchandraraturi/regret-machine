export interface ShareCardData {
  cardName: string;
  regretScore: number;
  regretLabel: string;
  tierLine: string;
  footerLine: string;
}

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

export function drawShareCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData,
): HTMLCanvasElement {
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#F7FAFF';
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.fillStyle = '#0B63F6';
  ctx.fillRect(80, 120, 920, 16);

  ctx.fillStyle = '#0A1530';
  ctx.font = '700 64px "Archivo Variable", sans-serif';
  ctx.fillText('The Regret Machine', 80, 260);

  ctx.fillStyle = '#0B63F6';
  ctx.font = '900 120px "Archivo Variable", sans-serif';
  ctx.fillText(`${data.regretScore} / 100`, 80, 480);

  ctx.fillStyle = '#0A1530';
  ctx.font = '700 56px "Mukta", sans-serif';
  ctx.fillText(data.regretLabel, 80, 570);
  ctx.fillText(data.cardName, 80, 740);

  ctx.font = '600 44px "Mukta", sans-serif';
  ctx.fillText(data.tierLine, 80, 840);

  ctx.font = '400 32px "Mukta", sans-serif';
  ctx.fillText(data.footerLine, 80, 1780, 920);
  return canvas;
}

export async function renderShareCardBlob(data: ShareCardData): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const canvas = document.createElement('canvas');
  drawShareCard(canvas, data);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob failed'));
      }
    }, 'image/png');
  });
}

export async function shareOrDownloadCard(data: ShareCardData): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await renderShareCardBlob(data);
  const file = new File([blob], 'regret-machine-card.png', { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: data.cardName });
      return 'shared';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'regret-machine-card.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
