import { describe, expect, it } from 'vitest';
import { getScenesConfig } from '../../src/core/data';
import { computeRegret, scoreBattery } from '../../src/core/scoring';
import type { SceneResult } from '../../src/core/types';

describe('P6 battery scene scoring & regret', () => {
  const scenes = getScenesConfig();

  it('computes battery score at 0, 5, 10 tasks and clamps out-of-range', () => {
    expect(scoreBattery(0, 10)).toBe(0);
    expect(scoreBattery(5, 10)).toBe(50);
    expect(scoreBattery(10, 10)).toBe(100);
    expect(scoreBattery(15, 10)).toBe(100);
    expect(scoreBattery(-2, 10)).toBe(0);
  });

  it('computes battery regret line points matching architecture §8', () => {
    const results: SceneResult[] = [
      { sceneId: 'lecture', playerScore: 0, events: [] },
      {
        sceneId: 'battery',
        playerScore: scoreBattery(5, 10),
        events: [
          { sceneId: 'battery', lineKey: 'regret.battery', points: 0 },
          { sceneId: 'battery', lineKey: 'scene.battery.fail', points: 0 },
        ],
      },
      { sceneId: 'creator', playerScore: 0, events: [] },
      { sceneId: 'private', playerScore: 0, events: [] },
    ];
    const breakdown = computeRegret('study', results, scenes);
    const sum = breakdown.lines.reduce((acc, l) => acc + l.points, 0);
    expect(sum).toBe(breakdown.regret);
    expect(breakdown.regret).toBeGreaterThanOrEqual(60);
    expect(breakdown.regret).toBeLessThanOrEqual(100);
  });
});
