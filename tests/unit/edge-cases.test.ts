import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { claim } from '../../src/core/data';
import { translate } from '../../src/core/i18n';
import { createIdleController } from '../../src/core/idle';
import { createStore } from '../../src/core/store';
import { shareOrDownloadCard } from '../../src/engines/sharecard';
import { createStaffScreen } from '../../src/screens/staff';

describe('unit edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('throws on unknown claim id', () => {
    expect(() => claim('C-DOES-NOT-EXIST')).toThrow(/Missing claim/);
  });

  it('returns CONTENT_MISSING for missing copy key in dev', () => {
    expect(translate('en', 'missing.edge.key')).toBe('CONTENT_MISSING:missing.edge.key');
    expect(translate('hi', 'missing.edge.key')).toBe('CONTENT_MISSING:missing.edge.key');
  });

  it('idle reset clears persona, laptop, and results', () => {
    const store = createStore('en', true);
    store.setPersona('create');
    store.setLaptop('zesta-glow');
    store.addSceneResult({
      sceneId: 'battery',
      playerScore: 40,
      events: [{ sceneId: 'battery', lineKey: 'receipt.line.battery', points: 20 }],
    });
    store.setDecay(0.75);
    store.startSession(12345);

    const idle = createIdleController(60, () => store.reset());
    idle.start();
    vi.advanceTimersByTime(60_000);

    const after = store.getState();
    expect(after.persona).toBeNull();
    expect(after.laptopId).toBeNull();
    expect(after.results).toEqual([]);
    expect(after.decay).toBe(0);
    expect(after.startedAt).toBeNull();
    idle.stop();
  });

  it('sharecard cancel path (AbortError) resolves cancelled without throwing', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      font: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => {
      cb(new Blob(['png'], { type: 'image/png' }));
    });
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(Object.assign(new Error('Cancelled'), { name: 'AbortError' })),
    });

    const outcome = await shareOrDownloadCard({
      cardName: 'Intel Core Ultra Series 3',
      regretScore: 84,
      regretLabel: 'High regret',
      tierLine: 'Tier line',
      footerLine: 'Footer line',
    });
    expect(outcome).toBe('cancelled');
  });

  it('Staff QR empty VITE_NEXT_STEP_URL renders not_configured and never a fake URL', () => {
    const store = createStore('en', true);
    store.setPersona('study');
    const root = document.createElement('div');
    const screen = createStaffScreen(() => {});
    screen.mount(root, {
      store,
      t: (k: string) => translate('en', k),
      claim,
      go: () => {},
    });

    const notConfigured = root.querySelector('[data-testid="staff-qr-not-configured"]');
    expect(notConfigured?.textContent).toBe('not_configured: VITE_NEXT_STEP_URL');
    expect(root.querySelector('[data-testid="staff-qr"]')).toBeNull();
    expect(root.textContent).not.toMatch(/https?:\/\//);
  });
});
