import { describe, expect, it } from 'vitest';
import { getLadder, getScenesConfig } from '../../src/core/data';
import { computeRecommendation, pickBestScene } from '../../src/core/result';
import type { Persona, SceneResult } from '../../src/core/types';

describe('result & recommendation', () => {
  const ladder = getLadder();
  const scenes = getScenesConfig();

  it('returns 4 different recommendation cards for 4 personas', () => {
    const results: SceneResult[] = [
      { sceneId: 'lecture', playerScore: 50, events: [] },
      { sceneId: 'battery', playerScore: 50, events: [] },
      { sceneId: 'creator', playerScore: 50, events: [] },
      { sceneId: 'private', playerScore: 50, events: [] },
    ];

    const cards = (['study', 'create', 'game', 'hustle'] as Persona[]).map(
      (p) => computeRecommendation(p, results, ladder, scenes).card.en,
    );
    expect(new Set(cards).size).toBe(4);
  });

  it('breaks ties using ladder.json tiebreak order per persona', () => {
    const tied: SceneResult[] = [
      { sceneId: 'lecture', playerScore: 75, events: [] },
      { sceneId: 'battery', playerScore: 75, events: [] },
      { sceneId: 'creator', playerScore: 75, events: [] },
      { sceneId: 'private', playerScore: 75, events: [] },
    ];

    expect(pickBestScene('study', tied, ladder)).toBe('lecture');
    expect(pickBestScene('create', tied, ladder)).toBe('creator');
    expect(pickBestScene('game', tied, ladder)).toBe('creator');
    expect(pickBestScene('hustle', tied, ladder)).toBe('battery');
  });
});
