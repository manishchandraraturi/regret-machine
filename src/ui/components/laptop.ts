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

  const bezel = document.createElement('div');
  bezel.className = 'rm-laptop-bezel';

  const cam = document.createElement('span');
  cam.className = 'rm-laptop-cam';
  cam.setAttribute('aria-hidden', 'true');

  const screenSlot = document.createElement('div');
  screenSlot.className = 'rm-laptop-screen';

  bezel.append(cam, screenSlot);
  lid.appendChild(bezel);

  const hinge = document.createElement('div');
  hinge.className = 'rm-laptop-hinge';
  hinge.setAttribute('aria-hidden', 'true');

  const deck = document.createElement('div');
  deck.className = 'rm-laptop-deck';
  deck.setAttribute('aria-hidden', 'true');

  const keys = document.createElement('div');
  keys.className = 'rm-laptop-keys';

  const trackpad = document.createElement('div');
  trackpad.className = 'rm-laptop-trackpad';

  deck.append(keys, trackpad);
  wrap.append(lid, hinge, deck);
  return { element: wrap, screenSlot };
}
