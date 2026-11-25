function buildStarburstPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const points: string[] = [];
  const total = 32;
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = (cx + Math.cos(angle) * r).toFixed(1);
    const y = (cy + Math.sin(angle) * r).toFixed(1);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

export interface StarburstOptions {
  curled?: boolean;
}

export function createStarburst(text: string, options: StarburstOptions = {}): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'rm-starburst';
  wrap.dataset.curled = options.curled ? 'true' : 'false';

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('rm-starburst-svg');

  const poly = document.createElementNS(ns, 'polygon');
  poly.setAttribute('points', buildStarburstPoints(80, 80, 74, 54));
  poly.classList.add('rm-starburst-poly');
  svg.appendChild(poly);

  const label = document.createElement('span');
  label.className = 'rm-starburst-text';
  label.textContent = text;

  wrap.append(svg, label);
  return wrap;
}
