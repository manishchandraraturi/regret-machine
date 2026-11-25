import { describe, expect, it } from 'vitest';
import { mountApp } from '../../src/main';

describe('app shell smoke', () => {
  it('renders The Regret Machine title', () => {
    const root = document.createElement('div');
    mountApp(root);
    expect(root.querySelector('h1')?.textContent).toBe('The Regret Machine');
  });
});
