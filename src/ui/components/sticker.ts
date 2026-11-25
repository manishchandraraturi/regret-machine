export interface StickerOptions {
  className?: string;
}

export function createSticker(text: string, options: StickerOptions = {}): HTMLElement {
  const el = document.createElement('span');
  el.className = options.className ? `rm-sticker ${options.className}` : 'rm-sticker';
  el.textContent = text;
  return el;
}
