import { prefersReducedMotion } from '../decay';

export interface PriceTagProps {
  price: string;
  mrp: string;
  label: string;
  selected?: boolean;
  onSelect?: () => void;
}

export interface PriceTagHandle {
  element: HTMLButtonElement;
  setSelected(selected: boolean): void;
}

function createTagStringSvg(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 28 28');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('rm-pricetag-string');

  const line = document.createElementNS(ns, 'path');
  line.setAttribute('d', 'M 14 0 L 14 18');
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('fill', 'none');

  const hole = document.createElementNS(ns, 'circle');
  hole.setAttribute('cx', '14');
  hole.setAttribute('cy', '20');
  hole.setAttribute('r', '4');
  hole.setAttribute('stroke', 'currentColor');
  hole.setAttribute('stroke-width', '2');
  hole.setAttribute('fill', 'none');

  svg.append(line, hole);
  return svg;
}

export function createPriceTag(props: PriceTagProps): PriceTagHandle {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rm-pricetag';
  btn.setAttribute('aria-pressed', props.selected ? 'true' : 'false');

  const mrpEl = document.createElement('span');
  mrpEl.className = 'rm-pricetag-mrp';
  mrpEl.textContent = props.mrp;

  const priceEl = document.createElement('span');
  priceEl.className = 'rm-pricetag-price';
  priceEl.textContent = props.price;

  const labelEl = document.createElement('span');
  labelEl.className = 'rm-pricetag-label';
  labelEl.textContent = props.label;

  btn.append(createTagStringSvg(), mrpEl, priceEl, labelEl);

  const setSelected = (selected: boolean): void => {
    btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    if (selected && !prefersReducedMotion() && typeof btn.animate === 'function') {
      btn.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-5deg)' },
          { transform: 'rotate(4deg)' },
          { transform: 'rotate(-2deg)' },
          { transform: 'rotate(0deg)' },
        ],
        { duration: 400, easing: 'ease-out' },
      );
    }
  };

  if (props.onSelect) {
    const handler = props.onSelect;
    btn.addEventListener('click', () => handler());
  }

  return { element: btn, setSelected };
}
