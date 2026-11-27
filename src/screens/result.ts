import { getLadder, getScenesConfig } from '../core/data';
import { computeRecommendation } from '../core/result';
import type { Ctx, Screen } from '../core/types';
import { shareOrDownloadCard } from '../engines/sharecard';
import { createButton } from '../ui/components/button';

export function createResultScreen(onReset: () => void): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const state = ctx.store.getState();
      const persona = state.persona ?? 'study';
      const lang = state.lang;
      const rec = computeRecommendation(persona, state.results, getLadder(), getScenesConfig());

      const wrap = document.createElement('section');
      wrap.className = 'rm-shelf skin-clear';
      wrap.dataset.screen = 'result';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('result.title');

      const grid = document.createElement('div');
      grid.className = 'rm-result-grid stage-window';

      const card = document.createElement('div');
      card.className = 'rm-result-card';

      const cardTitle = document.createElement('h2');
      cardTitle.className = 'type-title';
      cardTitle.textContent = rec.card[lang];

      const tier = document.createElement('p');
      tier.className = 'type-body';
      tier.textContent = rec.tier[lang];

      const regret = document.createElement('p');
      regret.className = 'type-body';
      regret.textContent = `${ctx.t('receipt.total')}: ${rec.regret} / 100 (${ctx.t(
        rec.labelKey,
      )})`;

      const why = document.createElement('p');
      why.className = 'type-small';
      why.textContent = `${ctx.t('result.why')} ${ctx.t(rec.whyKey)}`;

      card.append(cardTitle, tier, regret, why);

      const rightCol = document.createElement('div');
      rightCol.className = 'rm-shelf';

      const asksList = document.createElement('ul');
      asksList.className = 'rm-ask-list';
      for (const askKey of rec.asks) {
        const li = document.createElement('li');
        li.textContent = ctx.t(askKey);
        asksList.appendChild(li);
      }

      const glossary = document.createElement('div');
      glossary.className = 'rm-glossary';
      for (const gk of ['glossary.npu', 'glossary.tops', 'glossary.gpu']) {
        const gp = document.createElement('p');
        gp.className = 'type-small';
        gp.textContent = ctx.t(gk);
        glossary.appendChild(gp);
      }

      const actions = document.createElement('div');
      actions.className = 'rm-controls';
      actions.append(
        createButton({
          label: ctx.t('btn.save'),
          onClick: () => {
            void shareOrDownloadCard({
              cardName: rec.card[lang],
              regretScore: rec.regret,
              regretLabel: ctx.t(rec.labelKey),
              tierLine: rec.tier[lang],
              footerLine: ctx.t('footer.unofficial'),
            });
          },
        }),
        createButton({
          label: ctx.t('btn.staff'),
          variant: 'secondary',
          onClick: () => ctx.go('staff'),
        }),
        createButton({
          label: ctx.t('btn.again'),
          variant: 'secondary',
          onClick: onReset,
        }),
      );

      rightCol.append(asksList, glossary, actions);
      grid.append(card, rightCol);

      const footer = document.createElement('footer');
      footer.className = 'rm-footer';
      const tm = document.createElement('p');
      tm.className = 'type-small';
      tm.textContent = ctx.t('footer.trademark');
      const unoff = document.createElement('p');
      unoff.className = 'type-small';
      unoff.textContent = ctx.t('footer.unofficial');
      footer.append(tm, unoff);

      wrap.append(heading, grid, footer);
      root.replaceChildren(wrap);
      return () => {};
    },
  };
}
