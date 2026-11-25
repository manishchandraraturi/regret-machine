import type { Persona, SceneId, SceneResult, ScenesConfig } from './types';

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreLecture(caught: number, total = 8): number {
  if (total <= 0) return 0;
  return clampScore((caught / total) * 100);
}

export function scoreBattery(tasksDone: number, tasksSpawned = 10): number {
  if (tasksSpawned <= 0) return 0;
  return clampScore((tasksDone / tasksSpawned) * 100);
}

export function scoreCreator(fillPct: number): number {
  return clampScore(fillPct);
}

export function scorePrivate(correct: number, total = 6): number {
  if (total <= 0) return 0;
  return clampScore((correct / total) * 100);
}

export interface RegretLine {
  sceneId: SceneId;
  points: number;
}

export interface RegretBreakdown {
  regret: number;
  labelKey: 'regret.label.ouch' | 'regret.label.painful' | 'regret.label.low';
  lines: RegretLine[];
}

export function getRegretLabelKey(
  regret: number,
): 'regret.label.ouch' | 'regret.label.painful' | 'regret.label.low' {
  if (regret >= 90) return 'regret.label.ouch';
  if (regret >= 75) return 'regret.label.painful';
  return 'regret.label.low';
}

export function computeRegret(
  persona: Persona,
  results: SceneResult[],
  config: ScenesConfig,
): RegretBreakdown {
  const scoreMap = new Map<SceneId, number>();
  for (const r of results) {
    scoreMap.set(r.sceneId, clampScore(r.playerScore));
  }

  let sumW = 0;
  let sumWeightedSeverity = 0;
  const rawEntries: Array<{ sceneId: SceneId; wf: number }> = [];

  for (const sceneId of config.order) {
    const base = config.scenes[sceneId].base;
    const boost = config.boost[persona][sceneId] ?? 1.0;
    const w = base * boost;
    const s = (scoreMap.get(sceneId) ?? 0) / 100;
    const f = 1 - 0.4 * s;
    sumW += w;
    sumWeightedSeverity += w * f;
    rawEntries.push({ sceneId, wf: w * f });
  }

  const regret = sumW > 0 ? Math.round((100 * sumWeightedSeverity) / sumW) : 100;
  const lines: RegretLine[] = [];
  let running = 0;

  rawEntries.forEach((entry, idx) => {
    if (idx === rawEntries.length - 1) {
      lines.push({ sceneId: entry.sceneId, points: regret - running });
    } else {
      const pts = sumW > 0 ? Math.round((entry.wf / sumW) * 100) : 0;
      running += pts;
      lines.push({ sceneId: entry.sceneId, points: pts });
    }
  });

  return {
    regret,
    labelKey: getRegretLabelKey(regret),
    lines,
  };
}
