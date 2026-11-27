import type { Claim, Ctx } from '../core/types';
import { createButton } from '../ui/components/button';
import { createRevealControls } from './reveal-controls';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';

export interface RevealViewProps {
  ctx: Ctx;
  leftWord: string;
  rightWord: string;
  leftIcon: keyof typeof ICON_PATHS;
  rightIcon: keyof typeof ICON_PATHS;
  claim?: Claim;
  extraNote?: string;
  onComplete: () => void;
}

export function createRevealView(props: RevealViewProps): { element: HTMLElement; cleanup: () => void } {
  const { ctx, claim, onComplete } = props;
  const lang = ctx.store.getState().lang;

  const root = document.createElement('section');
  root.className = 'rm-reveal-hero';

  const split = document.createElement('div');
  split.className = 'rm-split-hero';

  const left = document.createElement('div');
  left.className = 'rm-split-side rm-split-side--left';
  const leftLabel = document.createElement('span');
  leftLabel.className = 'type-small rm-scrim';
  leftLabel.textContent = ctx.t('reveal.left');
  const leftVal = document.createElement('p');
  leftVal.className = 'rm-reveal-word';
  leftVal.append(makeSvgIcon(ICON_PATHS[props.leftIcon], 'rm-reveal-icon'), document.createTextNode(props.leftWord));
  left.append(leftLabel, leftVal);

  const right = document.createElement('div');
  right.className = 'rm-split-side rm-split-side--right';
  const rightLabel = document.createElement('span');
  rightLabel.className = 'type-small rm-scrim-clear';
  rightLabel.textContent = ctx.t('reveal.right');
  const rightVal = document.createElement('p');
  rightVal.className = 'rm-reveal-word rm-reveal-word--clear';
  rightVal.append(makeSvgIcon(ICON_PATHS[props.rightIcon], 'rm-reveal-icon'), document.createTextNode(props.rightWord));
  right.append(rightLabel, rightVal);

  if (claim) {
    const pillRow = document.createElement('div');
    pillRow.className = 'rm-pill-row';
    const pill = document.createElement('span');
    pill.className = 'rm-claim-pill';
    const unconf = claim.status === 'UNVERIFIED' ? ` (${ctx.t('reveal.unconfirmed')})` : '';
    pill.textContent = `${ctx.t(`tag.${claim.tag}`)}${unconf}`;

    const infoBtn = document.createElement('button');
    infoBtn.type = 'button';
    infoBtn.className = 'rm-info-btn';
    infoBtn.setAttribute('aria-label', ctx.t('reveal.details'));
    infoBtn.textContent = 'i';

    const dialog = document.createElement('dialog');
    dialog.className = 'rm-claim-sheet';
    const body = document.createElement('p');
    body.className = 'type-body';
    body.textContent = `${claim.text[lang]} (${ctx.t(`tag.${claim.tag}`)})`;
    const base = document.createElement('p');
    base.className = 'type-small';
    base.textContent = `${claim.baseline} · ${claim.source_name}`;
    const gloss = document.createElement('p');
    gloss.className = 'type-small';
    gloss.textContent = ctx.t('glossary.npu');
    const closeBtn = createButton({
      label: ctx.t('btn.close'),
      variant: 'secondary',
      onClick: () => dialog.close(),
    });
    dialog.append(body, base, gloss, closeBtn);
    if (props.extraNote) {
      const extra = document.createElement('p');
      extra.className = 'type-small';
      extra.dataset.testid = 'creator-baseline';
      extra.textContent = props.extraNote;
      dialog.insertBefore(extra, gloss);
    }

    infoBtn.addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', 'true');
    });

    pillRow.append(pill, infoBtn, dialog);
    right.appendChild(pillRow);
  }

  split.append(left, right);

  const foot = document.createElement('div');
  foot.className = 'rm-reveal-foot';
  const ill = document.createElement('span');
  ill.className = 'rm-split-illustration-pill';
  ill.textContent = ctx.t('tag.illustration');
  const ctrl = createRevealControls(ctx, onComplete);
  foot.append(ill, ctrl.element);

  root.append(split, foot);
  return { element: root, cleanup: ctrl.cleanup };
}
