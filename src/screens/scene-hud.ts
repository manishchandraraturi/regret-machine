import { getScenesConfig } from '../core/data';
import type { Ctx, SceneId } from '../core/types';
import { createButton } from '../ui/components/button';
import { ICON_PATHS, makeSvgIcon } from './scene-icons';

const NS = 'http://www.w3.org/2000/svg';
const WIFI_ARCS = [
  'M12 20h.01',
  'M8.53 16.11a6 6 0 0 1 6.95 0',
  'M5 12.55a11 11 0 0 1 14.08 0',
  'M1.42 9a16 16 0 0 1 21.16 0',
] as const;

export interface SceneIntroHandle {
  element: HTMLElement;
  dismiss: () => void;
}

export interface StakeMeterHandle {
  element: HTMLElement;
  update: (tMs: number) => void;
}

export function createSceneIntro(
  sceneId: SceneId,
  year: number,
  ctx: Ctx,
): SceneIntroHandle {
  const root = document.createElement('aside');
  root.className = 'rm-scene-intro';
  root.dataset.testid = 'scene-intro';

  const card = document.createElement('div');
  card.className = 'rm-scene-intro-card';

  const badge = document.createElement('span');
  badge.className = 'rm-scene-year';
  badge.textContent = ctx.t(`year.${year}`);

  const text = document.createElement('p');
  text.className = 'type-body rm-scene-intro-text';
  text.textContent = ctx.t(`scene.${sceneId}.intro`);

  let dismissed = false;
  let timer = 0;

  const startBtn = createButton({
    label: ctx.t('btn.start'),
    onClick: () => dismiss(),
  });
  startBtn.classList.add('rm-scene-intro-btn');

  const dismiss = (): void => {
    if (dismissed) return;
    dismissed = true;
    window.clearTimeout(timer);
    root.classList.add('rm-scene-intro--hidden');
    root.setAttribute('aria-hidden', 'true');
    startBtn.tabIndex = -1;
    startBtn.disabled = true;
  };

  timer = window.setTimeout(dismiss, 2000);
  card.append(badge, text, startBtn);
  root.appendChild(card);

  return { element: root, dismiss };
}

function buildWifiSvg(): { svg: SVGSVGElement; bars: SVGPathElement[] } {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('rm-wifi-bars');
  const bars = WIFI_ARCS.map((d) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2.4');
    p.setAttribute('stroke-linecap', 'round');
    p.classList.add('rm-wifi-bar', 'rm-wifi-bar--on');
    svg.appendChild(p);
    return p;
  });
  return { svg, bars };
}

export function createStakeMeter(sceneId: SceneId, ctx: Ctx): StakeMeterHandle {
  const meta = getScenesConfig().scenes[sceneId];
  const root = document.createElement('div');
  root.className = 'rm-stake-meter';
  root.setAttribute('role', 'status');
  root.dataset.testid = 'stake-meter';

  if (sceneId === 'lecture') {
    const { svg, bars } = buildWifiSvg();
    const lbl = document.createElement('span');
    lbl.className = 'rm-stake-label';
    lbl.textContent = ctx.t('timer.signal');
    root.append(svg, lbl);
    const dropMs = 9000;
    let lastBars = -1;
    let lastLost = false;
    return {
      element: root,
      update: (tMs: number) => {
        const lost = tMs >= dropMs;
        const activeCount = lost ? 0 : Math.max(1, Math.ceil(4 * (1 - tMs / dropMs)));
        if (activeCount === lastBars && lost === lastLost) return;
        lastBars = activeCount;
        lastLost = lost;
        root.classList.toggle('rm-stake-meter--low', activeCount <= 1);
        bars.forEach((b, idx) => b.classList.toggle('rm-wifi-bar--on', idx < activeCount));
        lbl.textContent = lost ? ctx.t('scene.lecture.nowifi') : ctx.t('timer.signal');
      },
    };
  }

  if (sceneId === 'battery') {
    const wrap = document.createElement('div');
    wrap.className = 'rm-battery-mini';
    const fill = document.createElement('div');
    fill.className = 'rm-battery-mini-fill';
    wrap.appendChild(fill);
    const pctEl = document.createElement('span');
    pctEl.className = 'rm-stake-pct';
    pctEl.textContent = '100%';
    root.append(wrap, pctEl);
    let lastPct = 100;
    return {
      element: root,
      update: (tMs: number) => {
        const ratio = Math.max(0, 1 - tMs / meta.playMs);
        const pct = Math.round(ratio * 100);
        if (pct === lastPct) return;
        lastPct = pct;
        fill.style.setProperty('transform', `scaleX(${ratio.toFixed(2)})`);
        root.classList.toggle('rm-stake-meter--low', ratio <= 0.3);
        pctEl.textContent = `${pct}%`;
      },
    };
  }

  const icon = makeSvgIcon(ICON_PATHS[sceneId === 'creator' ? 'clock' : 'shield'], 'rm-stake-icon');
  const bar = document.createElement('div');
  bar.className = 'rm-stake-bar';
  const barFill = document.createElement('div');
  barFill.className = 'rm-stake-bar-fill';
  bar.appendChild(barFill);
  const lbl = document.createElement('span');
  lbl.className = 'rm-stake-label';
  lbl.textContent = ctx.t(sceneId === 'creator' ? 'timer.deadline' : 'timer.privacy');
  root.append(icon, lbl, bar);

  let lastStep = 20;
  return {
    element: root,
    update: (tMs: number) => {
      const ratio = Math.max(0, 1 - tMs / meta.playMs);
      const step = Math.round(ratio * 20);
      if (step === lastStep) return;
      lastStep = step;
      barFill.style.setProperty('transform', `scaleX(${(step / 20).toFixed(2)})`);
      root.classList.toggle('rm-stake-meter--low', ratio <= 0.3);
    },
  };
}
