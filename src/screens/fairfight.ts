import { getFairFight } from '../core/data';
import type { Ctx, Screen } from '../core/types';
import { createButton } from '../ui/components/button';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';

function shortWords(text: string, maxWords = 5): string {
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ');
}

export function createFairFightScreen(): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const lang = ctx.store.getState().lang;
      const rows = getFairFight();

      const wrap = document.createElement('section');
      wrap.className = 'rm-shelf skin-clear rm-ff-u5';
      wrap.dataset.screen = 'fairfight';

      const head = document.createElement('div');
      head.className = 'rm-ff-head';
      const heading = document.createElement('h1');
      heading.className = 'type-title stage-window';
      heading.textContent = ctx.t('ff.title');

      const infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.className = 'rm-info-btn';
      infoBtn.setAttribute('aria-label', ctx.t('reveal.details'));
      infoBtn.textContent = 'i';
      head.append(heading, infoBtn);

      const dialog = document.createElement('dialog');
      dialog.className = 'rm-claim-sheet';
      const sub = document.createElement('p');
      sub.className = 'type-body';
      sub.textContent = ctx.t('ff.sub');
      dialog.appendChild(sub);

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
      const seenSources = new Set<string>();
      for (const row of rows) {
        const tr = document.createElement('tr');
        const rowHead = document.createElement('th');
        rowHead.scope = 'row';
        rowHead.textContent = shortWords(ctx.t(row.rowKey), 5);
        tr.appendChild(rowHead);

        for (const colKey of ['intel', 'amd', 'qc'] as const) {
          const cell = row.cells[colKey];
          const c = ctx.claim(cell.claim);
          const td = document.createElement('td');
          if (cell.concession) {
            td.className = 'rm-ff-concession';
            td.dataset.concession = 'true';
          }
          const iconKey = cell.concession ? 'check' : colKey === 'intel' ? 'check' : 'equals';
          const pill = document.createElement('div');
          pill.className = 'rm-ff-cell';
          pill.append(
            makeSvgIcon(ICON_PATHS[iconKey], 'rm-ff-icon'),
            document.createTextNode(shortWords(cell.text[lang], 5)),
          );
          td.appendChild(pill);
          tr.appendChild(td);

          if (!seenSources.has(c.id)) {
            seenSources.add(c.id);
            const srcLine = document.createElement('p');
            srcLine.className = 'type-small rm-ff-source';
            const statusLabel = c.status === 'UNVERIFIED' ? ` (${ctx.t('reveal.unconfirmed')})` : '';
            srcLine.textContent = `${c.id} · ${ctx.t(`tag.${c.tag}`)}${statusLabel} — ${cell.text[lang]}`;
            dialog.appendChild(srcLine);
          }
        }
        tbody.appendChild(tr);
      }

      const closeBtn = createButton({
        label: ctx.t('btn.close'),
        variant: 'secondary',
        onClick: () => dialog.close(),
      });
      dialog.appendChild(closeBtn);
      infoBtn.addEventListener('click', () => {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', 'true');
      });

      table.append(thead, tbody);
      tableWrap.appendChild(table);

      const cta = createButton({
        label: ctx.t('btn.next'),
        onClick: () => ctx.go('result'),
      });

      wrap.append(head, tableWrap, cta, dialog);
      root.replaceChildren(wrap);
      return () => {};
    },
  };
}
