import { describe, expect, it } from 'vitest';
import { getScenesConfig } from '../../src/core/data';
import { computeRegret, scorePrivate } from '../../src/core/scoring';
import type { SceneResult } from '../../src/core/types';

describe('P8 private files scene scoring & regret', () => {
  const scenes = getScenesConfig();

  it('computes private score at 0, 3, 6 correct and clamps out-of-range', () => {
    expect(scorePrivate(0, 6)).toBe(0);
    expect(scorePrivate(3, 6)).toBe(50);
    expect(scorePrivate(6, 6)).toBe(100);
    expect(scorePrivate(9, 6)).toBe(100);
    expect(scorePrivate(-1, 6)).toBe(0);
  });

  it('computes private regret line points matching architecture §8', () => {
    const results: SceneResult[] = [
      { sceneId: 'lecture', playerScore: 0, events: [] },
      { sceneId: 'battery', playerScore: 0, events: [] },
      { sceneId: 'creator', playerScore: 0, events: [] },
      {
        sceneId: 'private',
        playerScore: scorePrivate(3, 6),
        events: [{ sceneId: 'private', lineKey: 'regret.private', points: 0 }],
      },
    ];
    const breakdown = computeRegret('hustle', results, scenes);
    const sum = breakdown.lines.reduce((acc, l) => acc + l.points, 0);
    expect(sum).toBe(breakdown.regret);
  });
});
