import { setDecay } from '../decay';

export interface SplitRevealProps {
  decay: number;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
  claimText: string;
}

export function createSplitReveal(props: SplitRevealProps): HTMLElement {
  const root = document.createElement('section');
  root.className = 'rm-split';

  const left = document.createElement('div');
  left.className = 'rm-split-half decay-scope';
  setDecay(left, props.decay);

  const leftHeading = document.createElement('h3');
  leftHeading.className = 'type-title';
  leftHeading.textContent = props.leftTitle;

  const leftDesc = document.createElement('p');
  leftDesc.className = 'type-body';
  leftDesc.textContent = props.leftBody;

  left.append(leftHeading, leftDesc);

  const divider = document.createElement('div');
  divider.className = 'rm-split-divider';
  divider.setAttribute('aria-hidden', 'true');

  const right = document.createElement('div');
  right.className = 'rm-split-half skin-clear decay-scope';
  setDecay(right, 0);

  const rightHeading = document.createElement('h3');
  rightHeading.className = 'type-title';
  rightHeading.textContent = props.rightTitle;

  const rightDesc = document.createElement('p');
  rightDesc.className = 'type-body';
  rightDesc.textContent = props.rightBody;

  const claim = document.createElement('span');
  claim.className = 'rm-split-claim';
  claim.textContent = props.claimText;

  right.append(rightHeading, rightDesc, claim);

  const illustrationTag = document.createElement('span');
  illustrationTag.className = 'rm-split-illustration';
  illustrationTag.textContent = 'Illustration';

  root.append(left, divider, right, illustrationTag);
  return root;
}
