import { describe, expect, it, vi } from 'vitest';
import { createButton } from '../../src/ui/components/button';
import { createChip } from '../../src/ui/components/chip';
import { createPriceTag } from '../../src/ui/components/pricetag';
import { createSplitReveal } from '../../src/ui/components/splitreveal';
import { createStarburst } from '../../src/ui/components/starburst';
import { createSticker } from '../../src/ui/components/sticker';
import { createTape } from '../../src/ui/components/tape';
import { createYearFlip } from '../../src/ui/components/yearflip';

describe('P1 components', () => {
  it('renders Button and blocks click when disabled', () => {
    const onClick = vi.fn();
    const disabledBtn = createButton({ label: 'Disabled', disabled: true, onClick });
    expect(disabledBtn.getAttribute('aria-disabled')).toBe('true');
    disabledBtn.click();
    expect(onClick).not.toHaveBeenCalled();

    const activeBtn = createButton({ label: 'Go', onClick });
    activeBtn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('toggles Chip aria-pressed state', () => {
    const onToggle = vi.fn();
    const chip = createChip({ label: 'Study', selected: false, onToggle });
    expect(chip.element.getAttribute('aria-pressed')).toBe('false');
    chip.element.click();
    expect(chip.element.getAttribute('aria-pressed')).toBe('true');
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('renders Sticker, Starburst, and PriceTag', () => {
    const sticker = createSticker('Sale');
    expect(sticker.textContent).toBe('Sale');

    const starburst = createStarburst('Mega', { curled: true });
    expect(starburst.dataset.curled).toBe('true');

    const tag = createPriceTag({ mrp: '₹50,000', price: '₹38,990', label: 'A1' });
    tag.setSelected(true);
    expect(tag.element.getAttribute('aria-pressed')).toBe('true');
  });

  it('prints lines on Tape and updates total', () => {
    const tape = createTape('Receipt');
    tape.addLine({ label: 'Battery', points: 25 });
    tape.addLine({ label: 'Privacy', points: 15 });
    expect(tape.element.querySelectorAll('.rm-tape-line')).toHaveLength(2);
    expect(tape.element.querySelector('.rm-tape-footer')?.textContent).toContain('40');
  });

  it('renders SplitReveal with Illustration tag and YearFlip', () => {
    const split = createSplitReveal({
      decay: 0.5,
      leftTitle: 'Yours',
      leftBody: 'Slow',
      rightTitle: 'Intel',
      rightBody: 'Fast',
      claimText: 'Intel-claimed',
    });
    expect(split.textContent).toContain('Illustration');

    const flip = createYearFlip('Year 1');
    flip.flipTo('Year 2');
    expect(flip.element.textContent).toContain('Year 2');
  });
});
