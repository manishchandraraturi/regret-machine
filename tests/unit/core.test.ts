import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { claim, getScenesConfig } from '../../src/core/data';
import { getEnv } from '../../src/core/env';
import { getCopyKeys, parseLangParam, translate } from '../../src/core/i18n';
import { createIdleController, isFacilitatorMode } from '../../src/core/idle';
import { createMachine } from '../../src/core/machine';
import { createStore } from '../../src/core/store';

describe('core data, i18n, env, idle, machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws on unknown claim id', () => {
    expect(claim('C-01').id).toBe('C-01');
    expect(() => claim('C-999')).toThrow(/Missing claim/);
  });

  it('parses lang param with allowlist and returns CONTENT_MISSING for missing keys', () => {
    expect(parseLangParam('?lang=hi')).toBe('hi');
    expect(parseLangParam('?lang=<script>alert(1)</script>')).toBe('en');
    expect(parseLangParam('?lang=fr')).toBe('en');
    expect(translate('en', 'no.such.key')).toBe('CONTENT_MISSING:no.such.key');
  });

  it('verifies en/hi copy key parity with no missing values', () => {
    const enKeys = getCopyKeys('en');
    const hiKeys = getCopyKeys('hi');
    expect(enKeys).toEqual(hiKeys);
    for (const k of enKeys) {
      expect(translate('en', k)).not.toContain('CONTENT_MISSING:');
      expect(translate('hi', k)).not.toContain('CONTENT_MISSING:');
    }
  });

  it('parses env defaults safely', () => {
    const def = getEnv({});
    expect(def).toEqual({
      idleSeconds: 60,
      audioDefaultMuted: true,
      nextStepUrl: '',
      showBuildStamp: false,
    });
    const custom = getEnv({
      VITE_IDLE_SECONDS: '45',
      VITE_AUDIO_DEFAULT: 'on',
      VITE_NEXT_STEP_URL: 'https://www.intel.com/',
      VITE_SHOW_BUILD_STAMP: 'true',
    });
    expect(custom).toEqual({
      idleSeconds: 45,
      audioDefaultMuted: false,
      nextStepUrl: 'https://www.intel.com/',
      showBuildStamp: true,
    });
  });

  it('fires idle callback after configured seconds and resets on activity', () => {
    const onIdle = vi.fn();
    const idle = createIdleController(60, onIdle);
    idle.start();

    vi.advanceTimersByTime(50_000);
    expect(onIdle).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('pointerdown'));
    vi.advanceTimersByTime(50_000);
    expect(onIdle).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10_000);
    expect(onIdle).toHaveBeenCalledTimes(1);
    idle.stop();
  });

  it('runs state machine flow and facilitator flag', () => {
    const store = createStore('en', true);
    store.setPersona('study');
    expect(store.getState().persona).toBe('study');

    const machine = createMachine(getScenesConfig(), { skipFairFight: true });
    expect(machine.current()).toBe('attract');
    machine.go('receipt');
    expect(machine.next()).toBe('result');
    expect(isFacilitatorMode('?facilitator=1')).toBe(true);
    expect(isFacilitatorMode('?facilitator=0')).toBe(false);
  });
});
