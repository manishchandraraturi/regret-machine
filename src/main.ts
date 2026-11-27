import './ui/fonts';
import './ui/tokens.css';
import './ui/base.css';
import './ui/components.css';
import './ui/controls.css';
import './ui/overlays-and-gallery.css';
import './ui/screens.css';
import './ui/p5-screens.css';
import './ui/scenes.css';
import './ui/f1-layout.css';
import './ui/fit-layout.css';
import './ui/stage3d.css';
import { claim, getScenesConfig } from './core/data';
import { getEnv } from './core/env';
import { parseLangParam, translate } from './core/i18n';
import { createIdleController, isFacilitatorMode } from './core/idle';
import { createMachine } from './core/machine';
import { createStore } from './core/store';
import type { Audio, Ctx, Screen, ScreenId, StageHint, Store } from './core/types';
import { createAudioEngine } from './engines/audio';
import { createAttractScreen } from './screens/attract';
import { createFairFightScreen } from './screens/fairfight';
import { createReceiptScreen } from './screens/receipt';
import { createResultScreen } from './screens/result';
import { createSceneFrameScreen } from './screens/scene-frame';
import { createFlipScreen } from './screens/scene-stub';
import { createShelfScreen } from './screens/shelf';
import { createStaffScreen } from './screens/staff';
import type { Stage3DHandle, StageState } from './stage3d';
import { createButton } from './ui/components/button';
import { createCrackOverlay, setDecay } from './ui/decay';

function buildFacilitatorBar(
  t: (k: string) => string,
  machine: ReturnType<typeof createMachine>,
  onReset: () => void,
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'rm-facilitator';
  bar.dataset.testid = 'facilitator-bar';
  bar.append(
    createButton({ label: t('btn.skip'), variant: 'secondary', onClick: () => machine.next() }),
    createButton({ label: t('result.title'), variant: 'secondary', onClick: () => machine.jumpToResult() }),
    createButton({ label: t('btn.again'), variant: 'secondary', onClick: onReset }),
  );
  return bar;
}

function buildTopbar(
  store: Store,
  audio: Audio,
  shell: HTMLElement,
  initialMuted: boolean,
  onLangChange: () => void,
): { topbar: HTMLElement } {
  const t = (k: string): string => translate(store.getState().lang, k);
  const topbar = document.createElement('header');
  topbar.className = 'rm-topbar';

  const brand = document.createElement('span');
  brand.className = 'rm-wordmark';
  brand.textContent = t('app.title');

  const controls = document.createElement('div');
  controls.className = 'rm-controls';

  const langBtn = createButton({
    label: t('toggle.lang'),
    variant: 'secondary',
    onClick: () => {
      const nextLang = store.getState().lang === 'en' ? 'hi' : 'en';
      store.setLang(nextLang);
      shell.lang = nextLang;
      brand.textContent = t('app.title');
      langBtn.textContent = t('toggle.lang');
      muteBtn.textContent = t('toggle.mute');
      onLangChange();
    },
  });

  const muteBtn = createButton({
    label: t('toggle.mute'),
    variant: 'secondary',
    onClick: () => {
      const nextMuted = !store.getState().muted;
      store.setMuted(nextMuted);
      audio.setMuted(nextMuted);
      muteBtn.setAttribute('aria-pressed', nextMuted ? 'false' : 'true');
    },
  });
  muteBtn.setAttribute('aria-pressed', initialMuted ? 'false' : 'true');
  controls.append(langBtn, muteBtn);
  topbar.append(brand, controls);
  return { topbar };
}

function buildScreens(shell: HTMLElement, audio: Audio, onReset: () => void): Record<ScreenId, Screen> {
  return {
    attract: createAttractScreen(),
    shelf: createShelfScreen(audio),
    flip1: createFlipScreen('year.1', 'lecture', 0.25, shell),
    lecture: createSceneFrameScreen('lecture', 'flip2', shell, audio),
    flip2: createFlipScreen('year.2', 'battery', 0.5, shell),
    battery: createSceneFrameScreen('battery', 'creator', shell, audio),
    creator: createSceneFrameScreen('creator', 'flip3', shell, audio),
    flip3: createFlipScreen('year.3', 'private', 0.75, shell),
    private: createSceneFrameScreen('private', 'receipt', shell, audio),
    receipt: createReceiptScreen(audio),
    fairfight: createFairFightScreen(),
    result: createResultScreen(onReset),
    staff: createStaffScreen(onReset),
  };
}

function buildSnapshot(store: Store, screen: ScreenId, hints: StageHint): StageState {
  const st = store.getState();
  return {
    screen,
    decay: st.decay,
    persona: st.persona,
    laptopId: st.laptopId,
    hoveredLaptopId: hints.hoveredLaptopId,
    scenePhase: hints.scenePhase,
    sceneAlert: hints.sceneAlert,
    buyFlash: hints.buyFlash,
  };
}

export function mountApp(root: HTMLElement, search = window.location.search): () => void {
  const env = getEnv();
  const initialLang = parseLangParam(search);
  const store = createStore(initialLang, env.audioDefaultMuted);
  const audio = createAudioEngine(env.audioDefaultMuted);
  const shell = document.createElement('div');
  shell.className = 'rm-shell decay-scope';
  shell.lang = initialLang;
  setDecay(shell, 0);
  shell.appendChild(createCrackOverlay());

  const main = document.createElement('main');
  let cleanupScreen: (() => void) | null = null;
  let stage3d: Stage3DHandle | null = null;
  let disposed = false;
  let flashTimer: number | null = null;
  const hints: StageHint = { hoveredLaptopId: null, scenePhase: 'PLAY', sceneAlert: false, buyFlash: false };

  const machine = createMachine(getScenesConfig(), { skipFairFight: false, onNavigate: renderScreen });
  const sync3d = (): void => stage3d?.sync(buildSnapshot(store, machine.current(), hints));
  const t = (k: string): string => translate(store.getState().lang, k);
  const setStageHint = (next: Partial<StageHint>): void => {
    Object.assign(hints, next);
    if (next.buyFlash) {
      if (flashTimer !== null) window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => {
        hints.buyFlash = false;
        sync3d();
      }, 360);
    }
    sync3d();
  };

  const ctx: Ctx = { store, t, claim, go: (to) => machine.go(to), setStageHint };
  const fullReset = (): void => {
    store.reset();
    hints.hoveredLaptopId = null;
    hints.scenePhase = 'PLAY';
    hints.sceneAlert = false;
    setDecay(shell, 0);
    machine.reset();
  };

  const { topbar } = buildTopbar(store, audio, shell, env.audioDefaultMuted, () => renderScreen(machine.current()));
  shell.append(topbar, main);
  if (isFacilitatorMode(search)) shell.appendChild(buildFacilitatorBar(t, machine, fullReset));
  root.replaceChildren(shell);

  const screenMap = buildScreens(shell, audio, fullReset);
  function renderScreen(screenId: ScreenId): void {
    cleanupScreen?.();
    hints.hoveredLaptopId = null;
    hints.scenePhase = 'PLAY';
    hints.sceneAlert = false;
    const isClear = screenId === 'result' || screenId === 'staff' || screenId === 'fairfight';
    shell.classList.toggle('skin-clear', isClear);
    document.body.classList.toggle('skin-clear', isClear);
    document.documentElement.classList.toggle('skin-clear', isClear);
    if (isClear) {
      shell.style.setProperty('--sat', '1');
      shell.style.setProperty('--dim', '1');
    } else {
      shell.style.removeProperty('--sat');
      shell.style.removeProperty('--dim');
      setDecay(shell, store.getState().decay);
    }
    cleanupScreen = screenMap[screenId].mount(main, ctx);
    sync3d();
  }

  const idle = createIdleController(env.idleSeconds, fullReset);
  idle.start();
  renderScreen(machine.current());
  window.requestAnimationFrame(() => {
    if (disposed || !root.isConnected) return;
    void import('./stage3d').then(async (mod) => {
      if (disposed || !root.isConnected) return;
      stage3d = await mod.mountStage3D(root, buildSnapshot(store, machine.current(), hints), search);
      sync3d();
    });
  });

  return () => {
    disposed = true;
    if (flashTimer !== null) window.clearTimeout(flashTimer);
    cleanupScreen?.();
    stage3d?.dispose();
    idle.stop();
    delete root.dataset.stageMode;
    delete root.dataset.stageReason;
    document.body.classList.remove('skin-clear');
    document.documentElement.classList.remove('skin-clear');
  };
}

const appRoot = document.getElementById('app');
if (appRoot) {
  mountApp(appRoot);
}
