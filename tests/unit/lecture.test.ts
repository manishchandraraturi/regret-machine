import { describe, expect, it } from 'vitest';
import { getScenesConfig } from '../../src/core/data';
import { computeRegret, scoreLecture } from '../../src/core/scoring';
import type { SceneResult } from '../../src/core/types';

describe('P7 lecture scene scoring & regret', () => {
  const scenes = getScenesConfig();

  it('computes lecture score at 0, 4, 8 caught and clamps out-of-range', () => {
    expect(scoreLecture(0, 8)).toBe(0);
    expect(scoreLecture(4, 8)).toBe(50);
    expect(scoreLecture(8, 8)).toBe(100);
    expect(scoreLecture(10, 8)).toBe(100);
    expect(scoreLecture(-1, 8)).toBe(0);
  });

  it('computes lecture regret line points matching architecture §8', () => {
    const results: SceneResult[] = [
      {
        sceneId: 'lecture',
        playerScore: scoreLecture(4, 8),
        events: [{ sceneId: 'lecture', lineKey: 'regret.lecture', points: 0 }],
      },
      { sceneId: 'battery', playerScore: 0, events: [] },
      { sceneId: 'creator', playerScore: 0, events: [] },
      { sceneId: 'private', playerScore: 0, events: [] },
    ];
    const breakdown = computeRegret('study', results, scenes);
    const sum = breakdown.lines.reduce((acc, l) => acc + l.points, 0);
    expect(sum).toBe(breakdown.regret);
  });
});
