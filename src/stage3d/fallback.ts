import { prefersReducedMotion } from '../ui/decay';

export interface FallbackInput {
  search: string;
  reducedMotion: boolean;
  hasWebGL2: boolean;
}

export function isLiteRequested(search: string): boolean {
  const clean = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(clean);
  return params.get('lite') === '1';
}

export function detectWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return gl !== null;
  } catch {
    return false;
  }
}

export function getFallbackReason(input: FallbackInput): 'lite' | 'reduced-motion' | 'no-webgl2' | null {
  if (isLiteRequested(input.search)) return 'lite';
  if (input.reducedMotion) return 'reduced-motion';
  if (!input.hasWebGL2) return 'no-webgl2';
  return null;
}

export function shouldUse3DStage(
  search = typeof window !== 'undefined' ? window.location.search : '',
): { enabled: boolean; reason: 'lite' | 'reduced-motion' | 'no-webgl2' | null } {
  const reason = getFallbackReason({
    search,
    reducedMotion: prefersReducedMotion(),
    hasWebGL2: detectWebGL2(),
  });
  return { enabled: reason === null, reason };
}
