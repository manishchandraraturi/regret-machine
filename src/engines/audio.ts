import type { Audio } from '../core/types';

type AudioCtor = new () => AudioContext;

function resolveAudioContext(): AudioCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function createAudioEngine(initialMuted = true): Audio {
  let muted = initialMuted;
  let ctx: AudioContext | null = null;

  const ensureContext = (): AudioContext | null => {
    if (muted) return null;
    if (ctx) return ctx;
    const Ctor = resolveAudioContext();
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      return ctx;
    } catch {
      return null;
    }
  };

  const tone = (freq: number, durationSec: number, type: OscillatorType, gainVal = 0.08): void => {
    const audioCtx = ensureContext();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSec);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationSec);
    } catch {
      // Stay silent if browser blocks playback
    }
  };

  return {
    setMuted(m: boolean): void {
      muted = m;
    },
    tick(): void {
      tone(880, 0.04, 'square', 0.05);
    },
    buzz(): void {
      tone(150, 0.18, 'sawtooth', 0.08);
    },
    chime(): void {
      tone(660, 0.14, 'sine', 0.08);
      tone(880, 0.18, 'sine', 0.06);
    },
    register(): void {
      tone(523.25, 0.08, 'triangle', 0.08);
      tone(1046.5, 0.14, 'triangle', 0.08);
    },
  };
}
