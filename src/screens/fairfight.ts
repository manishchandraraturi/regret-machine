import { getFairFight } from '../core/data';
import type { Ctx, Screen } from '../core/types';
import { createButton } from '../ui/components/button';

export function createFairFightScreen(): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const lang = ctx.store.getState().lang;
      const rows = getFairFight();

      const wrap = document.createElement('section');
      wrap.className = 'rm-shelf skin-clear';
      wrap.dataset.screen = 'fairfight';

      const heading = document.createElement('h1');
      heading.className = 'type-title';
      heading.textContent = ctx.t('ff.title');
      heading.classList.add('stage-window');

      const sub = document.createElement('p');
      sub.className = 'type-body';
      sub.textContent = ctx.t('ff.sub');

      const tableWrap = document.createElement('div');
      tableWrap.className = 'rm-ff-wrap';

      const table = document.createElement('table');
      table.className = 'rm-ff-table';

      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      for (const hKey of ['ff.title', 'ff.col.intel', 'ff.col.amd', 'ff.col.qc']) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = ctx.t(hKey);
        headRow.appendChild(th);
      }
      thead.appendChild(headRow);

      const tbody = document.createElement('tbody');
      for (const row of rows) {
        const tr = document.createElement('tr');
        const rowHead = document.createElement('th');
        rowHead.scope = 'row';
        rowHead.textContent = ctx.t(row.rowKey);
        tr.appendChild(rowHead);

        for (const colKey of ['intel', 'amd', 'qc'] as const) {
          const cell = row.cells[colKey];
          const c = ctx.claim(cell.claim);
          const td = document.createElement('td');
          if (cell.concession) {
            td.className = 'rm-ff-concession';
            td.dataset.concession = 'true';
          }

          const body = document.createElement('p');
          body.className = 'type-small';
          body.textContent = cell.text[lang];

          const src = document.createElement('span');
          src.className = 'rm-ff-source type-small';
          const statusLabel = c.status === 'UNVERIFIED' ? ' (unconfirmed)' : '';
          src.textContent = `${c.id} · ${ctx.t(`tag.${c.tag}`)}${statusLabel}`;

          td.append(body, src);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }

      table.append(thead, tbody);
      tableWrap.appendChild(table);

      const nextBtn = createButton({
        label: ctx.t('btn.next'),
        onClick: () => ctx.go('result'),
      });

      const footer = document.createElement('p');
      footer.className = 'type-small';
      footer.textContent = ctx.t('footer.trademark');

      wrap.append(heading, sub, tableWrap, nextBtn, footer);
      root.replaceChildren(wrap);
      return () => {};
    },
  };
}
