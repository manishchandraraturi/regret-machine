import { getLaptops } from '../core/data';
import type { Ctx, Screen } from '../core/types';
import { attachInput } from '../engines/input';
import { createButton } from '../ui/components/button';
import { createLaptop } from '../ui/components/laptop';
import { createPriceTag } from '../ui/components/pricetag';
import { createStarburst } from '../ui/components/starburst';

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function buildAttractCopy(ctx: Ctx, startGame: () => void): HTMLElement {
  const copyCol = document.createElement('div');
  copyCol.className = 'rm-attract-copy';

  const h1 = document.createElement('h1');
  h1.className = 'type-flyer';
  h1.textContent = ctx.t('attract.headline');

  const sub = document.createElement('p');
  sub.className = 'type-body';
  sub.textContent = ctx.t('attract.sub');

  const marquee = document.createElement('div');
  marquee.className = 'rm-marquee';
  marquee.setAttribute('aria-hidden', 'true');
  const track = document.createElement('div');
  track.className = 'rm-marquee-track';

  for (const lap of getLaptops()) {
    const tag = createPriceTag({
      price: formatInr(lap.price),
      mrp: formatInr(lap.mrp),
      label: lap.name,
    });
    tag.element.tabIndex = -1;
    track.appendChild(tag.element);
  }
  marquee.appendChild(track);

  const actions = document.createElement('div');
  actions.appendChild(createButton({ label: ctx.t('attract.cta'), onClick: startGame }));

  copyCol.append(h1, sub, marquee, actions);
  return copyCol;
}

function buildAttractVisual(ctx: Ctx): HTMLElement {
  const visualCol = document.createElement('div');
  visualCol.className = 'rm-attract-visual';

  const stage = document.createElement('div');
  stage.className = 'rm-attract-stage';

  const laptops = getLaptops();
  const heroLaptopMeta = laptops.find((l) => l.colourway === 'pink') ?? laptops[0];
  const heroLaptop = createLaptop('pink', heroLaptopMeta?.name ?? ctx.t('app.title'));
  const sb = createStarburst(ctx.t('sticker.sale'));
  sb.classList.add('rm-attract-starburst');

  stage.append(heroLaptop.element, sb);
  visualCol.appendChild(stage);
  return visualCol;
}

export function createAttractScreen(): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const wrap = document.createElement('section');
      wrap.className = 'rm-attract';
      wrap.dataset.screen = 'attract';

      const startGame = (): void => {
        ctx.store.startSession(performance.now());
        ctx.go('shelf');
      };

      const layout = document.createElement('div');
      layout.className = 'rm-attract-layout';
      layout.append(buildAttractCopy(ctx, startGame), buildAttractVisual(ctx));

      wrap.appendChild(layout);
      root.replaceChildren(wrap);

      const detachInput = attachInput(window, (ev) => {
        if (ev.kind === 'confirm') {
          startGame();
        }
      });

      return () => {
        detachInput();
      };
    },
  };
}
