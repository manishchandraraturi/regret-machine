import { getLaptops, getPersonas } from '../core/data';
import type { Audio, Ctx, Persona, Screen } from '../core/types';
import { attachInput } from '../engines/input';
import { createButton } from '../ui/components/button';
import { createChip } from '../ui/components/chip';
import { createLaptop } from '../ui/components/laptop';
import { createPriceTag, type PriceTagHandle } from '../ui/components/pricetag';
import { createSticker } from '../ui/components/sticker';

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function createShelfScreen(audio: Audio): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const state = ctx.store.getState();
      let selectedLaptop = state.laptopId;
      let selectedPersona: Persona | null = state.persona;

      const wrap = document.createElement('section');
      wrap.className = 'rm-shelf';
      wrap.dataset.screen = 'shelf';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('shelf.title');

      const grid = document.createElement('div');
      grid.className = 'rm-shelf-grid stage-window';

      const laptops = getLaptops();
      const tagHandles = new Map<string, PriceTagHandle>();

      const buyBtn = createButton({
        label: ctx.t('shelf.buy'),
        disabled: !(selectedLaptop && selectedPersona),
        onClick: () => {
          if (!selectedLaptop || !selectedPersona) return;
          audio.register();
          ctx.setStageHint?.({ buyFlash: true });
          ctx.go('flip1');
        },
      });
      buyBtn.classList.add('rm-btn--buy');

      const syncBuyState = (): void => {
        const ready = Boolean(selectedLaptop && selectedPersona);
        if (ready) {
          buyBtn.removeAttribute('aria-disabled');
        } else {
          buyBtn.setAttribute('aria-disabled', 'true');
        }
      };

      const selectLaptop = (id: string): void => {
        selectedLaptop = id;
        ctx.store.setLaptop(id);
        for (const [lid, handle] of tagHandles) {
          handle.setSelected(lid === id);
        }
        ctx.setStageHint?.({ hoveredLaptopId: null });
        syncBuyState();
      };

      for (const lap of laptops) {
        const item = document.createElement('div');
        item.className = 'rm-shelf-item';
        item.addEventListener('pointerenter', () => ctx.setStageHint?.({ hoveredLaptopId: lap.id }));
        item.addEventListener('pointerleave', () => ctx.setStageHint?.({ hoveredLaptopId: null }));
        item.addEventListener('focusin', () => ctx.setStageHint?.({ hoveredLaptopId: lap.id }));
        item.addEventListener('focusout', () => ctx.setStageHint?.({ hoveredLaptopId: null }));

        const stickers = document.createElement('div');
        stickers.className = 'rm-shelf-stickers';
        stickers.append(
          createSticker(ctx.t('sticker.ai')),
          createSticker(ctx.t('sticker.thin')),
          createSticker(ctx.t('sticker.sale')),
        );

        const tag = createPriceTag({
          price: formatInr(lap.price),
          mrp: formatInr(lap.mrp),
          label: lap.name,
          selected: selectedLaptop === lap.id,
          onSelect: () => selectLaptop(lap.id),
        });
        tagHandles.set(lap.id, tag);

        const laptopEl = createLaptop(lap.colourway, lap.name);
        item.append(stickers, tag.element, laptopEl.element);
        grid.appendChild(item);
      }

      const personaPrompt = document.createElement('p');
      personaPrompt.className = 'type-body';
      personaPrompt.textContent = ctx.t('shelf.persona.q');

      const personaRow = document.createElement('div');
      personaRow.className = 'rm-shelf-personas';

      const personas = getPersonas();
      const chipHandles = personas.map((p) => {
        const handle = createChip({
          label: state.lang === 'hi' ? p.hi : p.en,
          selected: selectedPersona === p.id,
          onToggle: () => {
            selectedPersona = p.id;
            ctx.store.setPersona(p.id);
            chipHandles.forEach((h, idx) => {
              h.setSelected(personas[idx].id === p.id);
            });
            syncBuyState();
          },
        });
        personaRow.appendChild(handle.element);
        return handle;
      });

      const hint = document.createElement('p');
      hint.className = 'type-small';
      hint.textContent = ctx.t('shelf.pick.first');

      const footer = document.createElement('div');
      footer.className = 'rm-controls';
      footer.append(buyBtn, hint);

      wrap.append(heading, grid, personaPrompt, personaRow, footer);
      root.replaceChildren(wrap);

      const detachInput = attachInput(window, (ev) => {
        if (ev.kind === 'select' && ev.index >= 0 && ev.index < laptops.length) {
          selectLaptop(laptops[ev.index].id);
        }
      });

      return () => {
        detachInput();
      };
    },
  };
}
