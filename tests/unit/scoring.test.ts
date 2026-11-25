import { describe, expect, it } from 'vitest';
import { getScenesConfig } from '../../src/core/data';
import {
  computeRegret,
  getRegretLabelKey,
  scoreBattery,
  scoreCreator,
  scoreLecture,
  scorePrivate,
} from '../../src/core/scoring';
import type { Persona, SceneResult } from '../../src/core/types';

describe('scoring', () => {
  const scenes = getScenesConfig();

  it('computes regret in [60, 100] with persona weights and lines summing to regret', () => {
    const results: SceneResult[] = [
      { sceneId: 'lecture', playerScore: 50, events: [] },
      { sceneId: 'battery', playerScore: 100, events: [] },
      { sceneId: 'creator', playerScore: 0, events: [] },
      { sceneId: 'private', playerScore: 50, events: [] },
    ];

    for (const persona of ['study', 'create', 'game', 'hustle'] as Persona[]) {
      const breakdown = computeRegret(persona, results, scenes);
      expect(breakdown.regret).toBeGreaterThanOrEqual(60);
      expect(breakdown.regret).toBeLessThanOrEqual(100);
      const lineSum = breakdown.lines.reduce((acc, l) => acc + l.points, 0);
      expect(lineSum).toBe(breakdown.regret);
    }
  });

  it('maps regret thresholds to label keys', () => {
    expect(getRegretLabelKey(90)).toBe('regret.label.ouch');
    expect(getRegretLabelKey(89)).toBe('regret.label.painful');
    expect(getRegretLabelKey(75)).toBe('regret.label.painful');
    expect(getRegretLabelKey(74)).toBe('regret.label.low');
  });

  it('computes per-scene player scores cleanly', () => {
    expect(scoreLecture(4, 8)).toBe(50);
    expect(scoreBattery(7, 10)).toBe(70);
    expect(scoreCreator(120)).toBe(100);
    expect(scorePrivate(3, 6)).toBe(50);
  });
});
