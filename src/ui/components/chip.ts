export interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
}

export interface ChipHandle {
  element: HTMLButtonElement;
  setSelected(selected: boolean): void;
}

export function createChip(props: ChipProps): ChipHandle {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rm-chip';
  btn.textContent = props.label;
  btn.setAttribute('aria-pressed', props.selected ? 'true' : 'false');

  const setSelected = (selected: boolean): void => {
    btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
  };

  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-pressed') !== 'true';
    setSelected(next);
    if (props.onToggle) {
      props.onToggle(next);
    }
  });

  return { element: btn, setSelected };
}
