export interface QualityState {
  degraded: boolean;
  pixelRatio: number;
  particleScale: number;
  postEffects: boolean;
  avgFrameMs: number;
  samples: number;
}

export interface AdaptiveQuality {
  recordFrame(dtMs: number): QualityState;
  getState(): QualityState;
}

export function createAdaptiveQuality(
  nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  sampleWindow = 60,
  thresholdMs = 24,
): AdaptiveQuality {
  const highDpr = Math.min(2, Math.max(1, nativeDpr));
  let totalMs = 0;
  let samples = 0;
  let locked = false;

  const state: QualityState = {
    degraded: false,
    pixelRatio: highDpr,
    particleScale: 1,
    postEffects: true,
    avgFrameMs: 16.7,
    samples: 0,
  };

  return {
    recordFrame(dtMs: number): QualityState {
      if (locked) return { ...state };
      const bounded = Math.max(1, Math.min(200, dtMs));
      totalMs += bounded;
      samples += 1;
      state.samples = samples;
      state.avgFrameMs = totalMs / samples;

      if (samples >= sampleWindow) {
        locked = true;
        if (state.avgFrameMs > thresholdMs) {
          state.degraded = true;
          state.pixelRatio = 1;
          state.particleScale = 0.5;
          state.postEffects = false;
        }
      }
      return { ...state };
    },
    getState(): QualityState {
      return { ...state };
    },
  };
}
