import { getLaptops } from '../core/data';
import type { Ctx, Screen } from '../core/types';
import { attachInput } from '../engines/input';
import { createButton } from '../ui/components/button';
import { createPriceTag } from '../ui/components/pricetag';
import { createStarburst } from '../ui/components/starburst';

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function createAttractScreen(): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const wrap = document.createElement('section');
      wrap.className = 'rm-attract';
      wrap.dataset.screen = 'attract';

      const hero = document.createElement('div');
      hero.className = 'rm-attract-hero';

      const h1 = document.createElement('h1');
      h1.className = 'type-flyer';
      h1.textContent = ctx.t('attract.headline');

      const sb = createStarburst(ctx.t('sticker.sale'));
      hero.append(h1, sb);

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

      const startGame = (): void => {
        ctx.store.startSession(performance.now());
        ctx.go('shelf');
      };

      const cta = createButton({
        label: ctx.t('attract.cta'),
        onClick: startGame,
      });

      const actions = document.createElement('div');
      actions.appendChild(cta);

      wrap.append(hero, sub, marquee, actions);
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
