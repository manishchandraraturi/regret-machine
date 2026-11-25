import qrcode from 'qrcode-generator';

export interface QrMatrix {
  size: number;
  isDark: (row: number, col: number) => boolean;
}

export function buildQrMatrix(url: string): QrMatrix {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  const size = qr.getModuleCount();
  return {
    size,
    isDark: (row: number, col: number) => qr.isDark(row, col),
  };
}

export function renderQrSvg(url: string, label = 'QR code'): SVGSVGElement {
  const matrix = buildQrMatrix(url);
  const quiet = 4;
  const total = matrix.size + quiet * 2;
  const ns = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${total} ${total}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', label);
  svg.classList.add('rm-qr-svg');

  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('width', String(total));
  bg.setAttribute('height', String(total));
  bg.setAttribute('fill', '#FFFFFF');
  svg.appendChild(bg);

  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (matrix.isDark(r, c)) {
        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', String(c + quiet));
        rect.setAttribute('y', String(r + quiet));
        rect.setAttribute('width', '1');
        rect.setAttribute('height', '1');
        rect.setAttribute('fill', '#000000');
        svg.appendChild(rect);
      }
    }
  }

  return svg;
}

export function qrToRgbaBuffer(
  url: string,
  scale = 4,
): { width: number; height: number; data: Uint8ClampedArray } {
  const matrix = buildQrMatrix(url);
  const quiet = 2;
  const sideModules = matrix.size + quiet * 2;
  const sizePx = sideModules * scale;
  const data = new Uint8ClampedArray(sizePx * sizePx * 4);

  for (let y = 0; y < sizePx; y++) {
    const mr = Math.floor(y / scale) - quiet;
    for (let x = 0; x < sizePx; x++) {
      const mc = Math.floor(x / scale) - quiet;
      const dark =
        mr >= 0 && mr < matrix.size && mc >= 0 && mc < matrix.size && matrix.isDark(mr, mc);
      const val = dark ? 0 : 255;
      const idx = (y * sizePx + x) * 4;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  return { width: sizePx, height: sizePx, data };
}
