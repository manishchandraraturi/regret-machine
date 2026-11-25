import { prefersReducedMotion } from '../decay';

export interface YearFlipHandle {
  element: HTMLElement;
  flipTo(yearLabel: string): void;
}

export function createYearFlip(initialLabel: string): YearFlipHandle {
  const root = document.createElement('div');
  root.className = 'rm-yearflip';

  let currentSheet = document.createElement('div');
  currentSheet.className = 'rm-yearflip-sheet';

  const makeHeading = (text: string): HTMLParagraphElement => {
    const p = document.createElement('p');
    p.className = 'type-flyer';
    p.textContent = text;
    return p;
  };

  currentSheet.appendChild(makeHeading(initialLabel));
  root.appendChild(currentSheet);

  const flipTo = (yearLabel: string): void => {
    const oldSheet = currentSheet;
    oldSheet.classList.add('rm-yearflip-sheet--peeling');

    const nextSheet = document.createElement('div');
    nextSheet.className = 'rm-yearflip-sheet';
    nextSheet.appendChild(makeHeading(yearLabel));

    root.appendChild(nextSheet);
    currentSheet = nextSheet;

    const cleanupDelay = prefersReducedMotion() ? 320 : 720;
    window.setTimeout(() => {
      oldSheet.remove();
    }, cleanupDelay);
  };

  return { element: root, flipTo };
}
