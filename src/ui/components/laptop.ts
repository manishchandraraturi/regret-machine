export type LaptopColourway = 'pink' | 'mint' | 'lilac';

export interface LaptopHandle {
  element: HTMLElement;
  screenSlot: HTMLElement;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

function makePoly(points: string, cls: string): SVGPolygonElement {
  const poly = document.createElementNS(SVG_NS, 'polygon');
  poly.setAttribute('points', points);
  poly.classList.add(cls);
  return poly;
}

function appendKeyboardKeys(svg: SVGSVGElement): void {
  const rows = [6, 11, 16];
  for (const y of rows) {
    for (let x = 28; x <= 198; x += 14) {
      const key = document.createElementNS(SVG_NS, 'rect');
      key.setAttribute('x', String(x));
      key.setAttribute('y', String(y));
      key.setAttribute('width', '10');
      key.setAttribute('height', '3');
      key.setAttribute('rx', '1');
      key.classList.add('rm-laptop-key');
      svg.appendChild(key);
    }
  }
}

function buildKeyboardDeckSvg(): SVGSVGElement {
  const baseSvg = document.createElementNS(SVG_NS, 'svg');
  baseSvg.setAttribute('viewBox', '0 0 240 34');
  baseSvg.setAttribute('aria-hidden', 'true');
  baseSvg.classList.add('rm-laptop-base');

  baseSvg.append(
    makePoly('16,0 224,0 240,32 0,32', 'rm-laptop-trapezoid'),
    makePoly('24,4 216,4 222,20 18,20', 'rm-laptop-deck'),
  );
  appendKeyboardKeys(baseSvg);
  baseSvg.appendChild(makePoly('94,22 146,22 150,28 90,28', 'rm-laptop-trackpad'));
  return baseSvg;
}

export function createLaptop(colourway: LaptopColourway, titleText: string): LaptopHandle {
  const wrap = document.createElement('div');
  wrap.className = `rm-laptop rm-laptop--${colourway}`;
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', titleText);

  const lid = document.createElement('div');
  lid.className = 'rm-laptop-lid';

  const bezel = document.createElement('div');
  bezel.className = 'rm-laptop-bezel';

  const cam = document.createElement('span');
  cam.className = 'rm-laptop-cam';
  cam.setAttribute('aria-hidden', 'true');

  const screenSlot = document.createElement('div');
  screenSlot.className = 'rm-laptop-screen';

  bezel.append(cam, screenSlot);
  lid.appendChild(bezel);
  wrap.append(lid, buildKeyboardDeckSvg());
  return { element: wrap, screenSlot };
}
