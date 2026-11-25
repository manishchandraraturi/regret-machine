export function mountApp(root: HTMLElement): void {
  const main = document.createElement('main');
  const h1 = document.createElement('h1');
  h1.textContent = 'The Regret Machine';
  main.appendChild(h1);
  root.replaceChildren(main);
}

const appRoot = document.getElementById('app');
if (appRoot) {
  mountApp(appRoot);
}
