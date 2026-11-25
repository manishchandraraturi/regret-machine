import './ui/fonts';
import './ui/tokens.css';
import './ui/base.css';
import './ui/components.css';
import './ui/overlays-and-gallery.css';

export function mountApp(root: HTMLElement): void {
  const main = document.createElement('main');
  main.className = 'decay-scope';
  const h1 = document.createElement('h1');
  h1.className = 'type-title';
  h1.textContent = 'The Regret Machine';
  main.appendChild(h1);
  root.replaceChildren(main);
}

const appRoot = document.getElementById('app');
if (appRoot) {
  mountApp(appRoot);
}
