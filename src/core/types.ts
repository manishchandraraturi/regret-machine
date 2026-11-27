export type Lang = 'en' | 'hi';
export type Persona = 'study' | 'create' | 'game' | 'hustle';
export type SceneId = 'lecture' | 'battery' | 'creator' | 'private';
export type ScreenId =
  | 'attract'
  | 'shelf'
  | 'flip1'
  | 'lecture'
  | 'flip2'
  | 'battery'
  | 'creator'
  | 'flip3'
  | 'private'
  | 'receipt'
  | 'fairfight'
  | 'result'
  | 'staff';

export type ClaimTag = 'intel-claimed' | 'third-party' | 'our-advice' | 'public-fact';

export interface Claim {
  id: string;
  tag: ClaimTag;
  text: { en: string; hi: string };
  metric: string;
  baseline: string;
  conditions: string;
  source_name: string;
  source_url: string;
  verified_on: string;
  status: 'VERIFIED' | 'UNVERIFIED';
}

export interface RegretEvent {
  sceneId: SceneId;
  lineKey: string;
  points: number;
}

export interface SceneResult {
  sceneId: SceneId;
  playerScore: number;
  events: RegretEvent[];
  stub?: boolean;
}

export interface GameState {
  lang: Lang;
  persona: Persona | null;
  laptopId: string | null;
  results: SceneResult[];
  decay: number;
  muted: boolean;
  startedAt: number | null;
}

export interface Store {
  getState(): GameState;
  setLang(lang: Lang): void;
  setPersona(persona: Persona): void;
  setLaptop(laptopId: string): void;
  setMuted(muted: boolean): void;
  addSceneResult(result: SceneResult): void;
  setDecay(decay: number): void;
  startSession(nowMs: number): void;
  reset(): void;
}

export interface StageHint {
  hoveredLaptopId: string | null;
  scenePhase: 'PLAY' | 'FAIL' | 'REVEAL';
  sceneAlert: boolean;
  buyFlash: boolean;
}

export interface Ctx {
  store: Store;
  t: (key: string) => string;
  claim: (id: string) => Claim;
  go: (to: ScreenId) => void;
  setStageHint?: (hint: Partial<StageHint>) => void;
}

export interface Screen {
  mount(root: HTMLElement, ctx: Ctx): () => void;
}

export interface Audio {
  setMuted(m: boolean): void;
  tick(): void;
  buzz(): void;
  chime(): void;
  register(): void;
}

export interface Loop {
  start(cb: (dtMs: number, tMs: number) => void): void;
  stop(): void;
}

export interface LaptopSpec {
  id: string;
  name: string;
  colourway: 'pink' | 'mint' | 'lilac';
  price: number;
  mrp: number;
}

export interface PersonaSpec {
  id: Persona;
  en: string;
  hi: string;
}

export interface SceneMeta {
  year: number;
  durationMs: number;
  playMs: number;
  revealMs: number;
  useCase: string;
  base: number;
  claims: string[];
  files?: Array<{ id: string; sensitive: boolean }>;
}

export interface ScenesConfig {
  order: SceneId[];
  scenes: Record<SceneId, SceneMeta>;
  boost: Record<Persona, Partial<Record<SceneId, number>>>;
  decayPerScene: number;
}

export interface LadderEntry {
  card: { en: string; hi: string };
  tier: { en: string; hi: string };
  tiebreak: SceneId[];
  asks: string[];
}

export type LadderConfig = Record<Persona, LadderEntry>;
