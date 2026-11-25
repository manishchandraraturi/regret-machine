import { computeRegret, type RegretLine } from './scoring';
import type { LadderConfig, Persona, SceneId, SceneResult, ScenesConfig } from './types';

export interface Recommendation {
  persona: Persona;
  card: { en: string; hi: string };
  tier: { en: string; hi: string };
  asks: string[];
  bestScene: SceneId;
  whyKey: string;
  regret: number;
  labelKey: 'regret.label.ouch' | 'regret.label.painful' | 'regret.label.low';
  lines: RegretLine[];
}

export function pickBestScene(
  persona: Persona,
  results: SceneResult[],
  ladder: LadderConfig,
): SceneId {
  const scoreMap = new Map<SceneId, number>();
  for (const r of results) {
    scoreMap.set(r.sceneId, r.playerScore);
  }

  const order = ladder[persona].tiebreak;
  let best = order[0];
  let bestScore = -1;

  for (const sceneId of order) {
    const s = scoreMap.get(sceneId) ?? 0;
    if (s > bestScore) {
      bestScore = s;
      best = sceneId;
    }
  }
  return best;
}

export function computeRecommendation(
  persona: Persona,
  results: SceneResult[],
  ladder: LadderConfig,
  scenes: ScenesConfig,
): Recommendation {
  const entry = ladder[persona];
  const bestScene = pickBestScene(persona, results, ladder);
  const breakdown = computeRegret(persona, results, scenes);

  return {
    persona,
    card: entry.card,
    tier: entry.tier,
    asks: [...entry.asks],
    bestScene,
    whyKey: `why.${bestScene}`,
    regret: breakdown.regret,
    labelKey: breakdown.labelKey,
    lines: breakdown.lines,
  };
}
