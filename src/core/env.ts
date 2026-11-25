export interface EnvConfig {
  idleSeconds: number;
  audioDefaultMuted: boolean;
  nextStepUrl: string;
  showBuildStamp: boolean;
}

function parseIdleSeconds(raw: unknown): number {
  const num = typeof raw === 'string' ? Number(raw.trim()) : Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return 60;
  }
  return Math.round(num);
}

function parseAudioDefaultMuted(raw: unknown): boolean {
  if (typeof raw === 'string' && raw.trim().toLowerCase() === 'on') {
    return false;
  }
  return true;
}

function parseNextStepUrl(raw: unknown): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw.trim();
}

function parseBooleanFlag(raw: unknown): boolean {
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'true';
}

export function getEnv(rawEnv?: Record<string, unknown>): EnvConfig {
  const source = rawEnv ?? (import.meta.env as Record<string, unknown>);
  return {
    idleSeconds: parseIdleSeconds(source.VITE_IDLE_SECONDS),
    audioDefaultMuted: parseAudioDefaultMuted(source.VITE_AUDIO_DEFAULT),
    nextStepUrl: parseNextStepUrl(source.VITE_NEXT_STEP_URL),
    showBuildStamp: parseBooleanFlag(source.VITE_SHOW_BUILD_STAMP),
  };
}
