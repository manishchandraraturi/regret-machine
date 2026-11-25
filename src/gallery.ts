import './ui/fonts';
import './ui/tokens.css';
import './ui/base.css';
import { createCrackOverlay, setDecay } from './ui/decay';
import { createButton } from './ui/components/button';
import { createChip } from './ui/components/chip';
import { createPriceTag } from './ui/components/pricetag';
import { createSplitReveal } from './ui/components/splitreveal';
import { createStarburst } from './ui/components/starburst';
import { createSticker } from './ui/components/sticker';
import { createTape } from './ui/components/tape';
import { createYearFlip } from './ui/components/yearflip';

function buildDecayStrip(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'gallery-section';
  const title = document.createElement('h2');
  title.className = 'type-title';
  title.textContent = 'Decay strip: 0 to 1.0';
  section.appendChild(title);

  const strip = document.createElement('div');
  strip.className = 'gallery-strip';
  strip.dataset.testid = 'decay-strip';

  for (const val of [0, 0.25, 0.5, 0.75, 1.0]) {
    const cell = document.createElement('div');
    cell.className = 'gallery-cell decay-scope';
    setDecay(cell, val);
    cell.appendChild(createCrackOverlay());

    const label = document.createElement('p');
    label.className = 'type-body';
    label.textContent = `Decay ${val}`;

    const sb = createStarburst('Mega sale');
    cell.append(label, sb);
    strip.appendChild(cell);
  }

  section.appendChild(strip);
  return section;
}

function buildSkinMatrix(skinName: string, clearSkin: boolean, decay: number): HTMLElement {
  const section = document.createElement('section');
  section.className = clearSkin
    ? 'gallery-section skin-clear decay-scope'
    : 'gallery-section decay-scope';
  setDecay(section, clearSkin ? 0 : decay);
  if (!clearSkin) {
    section.appendChild(createCrackOverlay());
  }

  const heading = document.createElement('h2');
  heading.className = 'type-title';
  heading.textContent = `${skinName} — decay ${decay}`;
  section.appendChild(heading);

  const row1 = document.createElement('div');
  row1.className = 'gallery-row';
  const sticker = createSticker('Flat ₹15,000 off');
  const starburst = createStarburst('Mega sale', { curled: !clearSkin && decay >= 0.5 });
  const tag = createPriceTag({
    mrp: '₹54,990',
    price: '₹38,990',
    label: 'Everyday 15',
    onSelect: () => tag.setSelected(tag.element.getAttribute('aria-pressed') !== 'true'),
  });
  row1.append(sticker, starburst, tag.element);

  const row2 = document.createElement('div');
  row2.className = 'gallery-row';
  const primaryBtn = createButton({ label: 'Buy it', onClick: () => {} });
  const secondaryBtn = createButton({
    label: 'Compare',
    variant: 'secondary',
    onClick: () => {},
  });
  const disabledBtn = createButton({
    label: 'Unavailable',
    disabled: true,
    onClick: () => {},
  });
  const chipA = createChip({ label: 'Study', selected: true });
  const chipB = createChip({ label: 'Create' });
  row2.append(primaryBtn, secondaryBtn, disabledBtn, chipA.element, chipB.element);

  const tape = createTape('Receipt');
  tape.addLine({ label: 'Lecture notes', points: 22 });
  tape.addLine({ label: 'Battery drain', points: 28 });

  const addLineBtn = createButton({
    label: 'Add tape line',
    variant: 'secondary',
    onClick: () => tape.addLine({ label: 'Export stall', points: 18 }),
  });

  const split = createSplitReveal({
    decay: clearSkin ? 0 : decay,
    leftTitle: 'Your laptop',
    leftBody: 'Battery drops mid-afternoon.',
    rightTitle: 'Intel AI PC',
    rightBody: 'Runs on-device all day.',
    claimText: 'Intel-claimed, up to 27 hours',
  });

  const flip = createYearFlip('Year 1');
  let yearNum = 1;
  const flipBtn = createButton({
    label: 'Flip year',
    onClick: () => {
      yearNum = yearNum >= 3 ? 1 : yearNum + 1;
      flip.flipTo(`Year ${yearNum}`);
    },
  });

  section.append(row1, row2, tape.element, addLineBtn, split, flip.element, flipBtn);
  return section;
}

function buildHindiSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'gallery-section decay-scope';
  section.lang = 'hi';

  const h = document.createElement('h2');
  h.className = 'type-flyer';
  h.textContent = 'मेगा सेल ₹38,990';

  const p = document.createElement('p');
  p.className = 'type-body';
  p.textContent = 'तीन साल का अनुभव दो मिनट में देखें। बिना किसी तकनीकी ज्ञान के।';

  section.append(h, p);
  return section;
}

export function mountGallery(root: HTMLElement): void {
  const page = document.createElement('main');
  page.className = 'gallery-page';

  const h1 = document.createElement('h1');
  h1.className = 'type-title';
  h1.textContent = 'Component Gallery';
  page.appendChild(h1);

  page.appendChild(buildDecayStrip());
  for (const d of [0, 0.5, 1]) {
    page.appendChild(buildSkinMatrix('Flyer skin', false, d));
    page.appendChild(buildSkinMatrix('Clear skin', true, d));
  }
  page.appendChild(buildHindiSection());

  root.replaceChildren(page);
}

const rootEl = document.getElementById('gallery');
if (rootEl) {
  mountGallery(rootEl);
}
