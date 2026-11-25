import type { Claim } from '../../core/types';
import { createButton } from './button';

export interface ClaimChipProps {
  claim: Claim;
  tagLabel: string;
  closeLabel: string;
}

export function createClaimChip(props: ClaimChipProps): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'rm-claimchip-wrap';

  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'rm-claimchip';
  pill.textContent = `${props.claim.metric} — ${props.tagLabel}`;

  const dialog = document.createElement('dialog');
  dialog.className = 'rm-claim-sheet';

  const title = document.createElement('h3');
  title.className = 'type-body';
  title.textContent = `${props.claim.id} (${props.tagLabel})`;

  const baseline = document.createElement('p');
  baseline.className = 'type-small';
  baseline.textContent = props.claim.baseline;

  const source = document.createElement('p');
  source.className = 'type-small';
  source.textContent = `${props.claim.source_name}: ${props.claim.source_url}`;

  const closeBtn = createButton({
    label: props.closeLabel,
    variant: 'secondary',
    onClick: () => {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    },
  });

  dialog.append(title, baseline, source, closeBtn);

  pill.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', 'true');
    }
  });

  wrap.append(pill, dialog);
  return wrap;
}
