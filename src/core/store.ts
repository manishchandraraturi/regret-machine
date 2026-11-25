import type { GameState, Lang, Persona, SceneResult, Store } from './types';

export function createStore(initialLang: Lang = 'en', initialMuted = true): Store {
  const state: GameState = {
    lang: initialLang,
    persona: null,
    laptopId: null,
    results: [],
    decay: 0,
    muted: initialMuted,
    startedAt: null,
  };

  return {
    getState(): GameState {
      return {
        ...state,
        results: [...state.results],
      };
    },
    setLang(lang: Lang): void {
      state.lang = lang;
    },
    setPersona(persona: Persona): void {
      state.persona = persona;
    },
    setLaptop(laptopId: string): void {
      state.laptopId = laptopId;
    },
    setMuted(muted: boolean): void {
      state.muted = muted;
    },
    addSceneResult(result: SceneResult): void {
      const idx = state.results.findIndex((r) => r.sceneId === result.sceneId);
      if (idx >= 0) {
        state.results[idx] = result;
      } else {
        state.results.push(result);
      }
    },
    setDecay(decay: number): void {
      state.decay = Math.max(0, Math.min(1, decay));
    },
    startSession(nowMs: number): void {
      state.startedAt = nowMs;
    },
    reset(): void {
      state.persona = null;
      state.laptopId = null;
      state.results = [];
      state.decay = 0;
      state.startedAt = null;
    },
  };
}
