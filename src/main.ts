import './ui/fonts';
import './ui/tokens.css';
import './ui/base.css';
import './ui/components.css';
import './ui/overlays-and-gallery.css';
import './ui/screens.css';
import './ui/p5-screens.css';
import './ui/scenes.css';
import './ui/f1-layout.css';
import { claim, getScenesConfig } from './core/data';
import { getEnv } from './core/env';
import { parseLangParam, translate } from './core/i18n';
import { createIdleController, isFacilitatorMode } from './core/idle';
import { createMachine } from './core/machine';
import { createStore } from './core/store';
import type { Ctx, Screen, ScreenId } from './core/types';
import { createAudioEngine } from './engines/audio';
import { createAttractScreen } from './screens/attract';
import { createFairFightScreen } from './screens/fairfight';
import { createReceiptScreen } from './screens/receipt';
import { createResultScreen } from './screens/result';
import { createSceneFrameScreen } from './screens/scene-frame';
import { createFlipScreen } from './screens/scene-stub';
import { createShelfScreen } from './screens/shelf';
import { createStaffScreen } from './screens/staff';
import { createButton } from './ui/components/button';
import { createCrackOverlay, setDecay } from './ui/decay';

export function mountApp(root: HTMLElement, search = window.location.search): () => void {
  const env = getEnv();
  const initialLang = parseLangParam(search);
  const store = createStore(initialLang, env.audioDefaultMuted);
  const audio = createAudioEngine(env.audioDefaultMuted);
  const scenes = getScenesConfig();
  const facilitator = isFacilitatorMode(search);

  const shell = document.createElement('div');
  shell.className = 'rm-shell decay-scope';
  shell.lang = initialLang;
  setDecay(shell, 0);
  shell.appendChild(createCrackOverlay());

  const topbar = document.createElement('header');
  topbar.className = 'rm-topbar';

  const brand = document.createElement('span');
  brand.className = 'rm-wordmark';
  brand.textContent = translate(initialLang, 'app.title');

  const controls = document.createElement('div');
  controls.className = 'rm-controls';
  const main = document.createElement('main');
  let cleanupScreen: (() => void) | null = null;

  const machine = createMachine(scenes, {
    skipFairFight: false,
    onNavigate: (screenId) => renderScreen(screenId),
  });

  const t = (key: string): string => translate(store.getState().lang, key);
  const ctx: Ctx = { store, t, claim, go: (to) => machine.go(to) };

  const fullReset = (): void => {
    store.reset();
    setDecay(shell, 0);
    machine.reset();
  };

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
      renderScreen(machine.current());
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
  muteBtn.setAttribute('aria-pressed', env.audioDefaultMuted ? 'false' : 'true');
  controls.append(langBtn, muteBtn);
  topbar.append(brand, controls);
  shell.append(topbar, main);

  if (facilitator) {
    const bar = document.createElement('div');
    bar.className = 'rm-facilitator';
    bar.dataset.testid = 'facilitator-bar';
    bar.append(
      createButton({ label: t('btn.skip'), variant: 'secondary', onClick: () => machine.next() }),
      createButton({
        label: t('result.title'),
        variant: 'secondary',
        onClick: () => machine.jumpToResult(),
      }),
      createButton({ label: t('btn.again'), variant: 'secondary', onClick: fullReset }),
    );
    shell.appendChild(bar);
  }

  root.replaceChildren(shell);

  const screenMap: Record<ScreenId, Screen> = {
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
    result: createResultScreen(fullReset),
    staff: createStaffScreen(fullReset),
  };

  function renderScreen(screenId: ScreenId): void {
    cleanupScreen?.();
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
  }

  const idle = createIdleController(env.idleSeconds, fullReset);
  idle.start();
  renderScreen(machine.current());

  return () => {
    cleanupScreen?.();
    idle.stop();
    document.body.classList.remove('skin-clear');
    document.documentElement.classList.remove('skin-clear');
  };
}

const appRoot = document.getElementById('app');
if (appRoot) {
  mountApp(appRoot);
}
