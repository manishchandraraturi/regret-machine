export type LaptopColourway = 'pink' | 'mint' | 'lilac';

export interface LaptopHandle {
  element: HTMLElement;
  screenSlot: HTMLElement;
}

export function createLaptop(colourway: LaptopColourway, titleText: string): LaptopHandle {
  const wrap = document.createElement('div');
  wrap.className = `rm-laptop rm-laptop--${colourway}`;
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', titleText);

  const lid = document.createElement('div');
  lid.className = 'rm-laptop-lid';

  const screenSlot = document.createElement('div');
  screenSlot.className = 'rm-laptop-screen';
  lid.appendChild(screenSlot);

  const ns = 'http://www.w3.org/2000/svg';
  const baseSvg = document.createElementNS(ns, 'svg');
  baseSvg.setAttribute('viewBox', '0 0 240 24');
  baseSvg.setAttribute('aria-hidden', 'true');
  baseSvg.classList.add('rm-laptop-base');

  const trap = document.createElementNS(ns, 'polygon');
  trap.setAttribute('points', '16,0 224,0 240,22 0,22');
  trap.classList.add('rm-laptop-trapezoid');
  baseSvg.appendChild(trap);

  wrap.append(lid, baseSvg);
  return { element: wrap, screenSlot };
}
