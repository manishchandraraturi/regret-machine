export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
}

export function createButton(props: ButtonProps): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className =
    props.variant === 'secondary' ? 'rm-btn rm-btn--secondary' : 'rm-btn rm-btn--primary';
  btn.textContent = props.label;

  if (props.disabled) {
    btn.setAttribute('aria-disabled', 'true');
  }

  btn.addEventListener('click', (event) => {
    if (btn.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      return;
    }
    props.onClick();
  });

  return btn;
}
