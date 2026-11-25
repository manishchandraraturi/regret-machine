import { describe, expect, it } from 'vitest';
import { mountApp } from '../../src/main';

describe('app shell smoke', () => {
  it('renders The Regret Machine shell and Attract screen', () => {
    const root = document.createElement('div');
    const cleanup = mountApp(root, '?lang=en');
    expect(root.textContent).toContain('The Regret Machine');
    expect(root.querySelector('[data-screen="attract"]')).not.toBeNull();
    cleanup();
  });
});
