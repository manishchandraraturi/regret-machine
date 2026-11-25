export type InputDirection = 'up' | 'down' | 'left' | 'right';

export type NormalizedInput =
  | { kind: 'select'; index: number; source: 'key' | 'pointer' }
  | { kind: 'move'; direction: InputDirection; source: 'key' }
  | { kind: 'confirm'; source: 'key' | 'pointer' };

const DIRECTION_MAP: Record<string, InputDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function normalizeKeyEvent(key: string): NormalizedInput | null {
  if (key >= '1' && key <= '6') {
    return { kind: 'select', index: Number(key) - 1, source: 'key' };
  }
  const direction = DIRECTION_MAP[key];
  if (direction) {
    return { kind: 'move', direction, source: 'key' };
  }
  if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
    return { kind: 'confirm', source: 'key' };
  }
  return null;
}

export function attachInput(
  target: HTMLElement | Window,
  onInput: (input: NormalizedInput) => void,
): () => void {
  const onKeyDown = (ev: Event): void => {
    const kev = ev as KeyboardEvent;
    const normalized = normalizeKeyEvent(kev.key);
    if (normalized) {
      onInput(normalized);
    }
  };

  target.addEventListener('keydown', onKeyDown);
  return () => {
    target.removeEventListener('keydown', onKeyDown);
  };
}
