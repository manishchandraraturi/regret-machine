import { getLadder, getPersonas, getScenesConfig } from '../core/data';
import { getEnv } from '../core/env';
import { computeRecommendation } from '../core/result';
import type { Ctx, Screen } from '../core/types';
import { renderQrSvg } from '../engines/qr';
import { createButton } from '../ui/components/button';

export function createStaffScreen(onReset: () => void): Screen {
  return {
    mount(root: HTMLElement, ctx: Ctx): () => void {
      const state = ctx.store.getState();
      const persona = state.persona ?? 'study';
      const lang = state.lang;
      const personaMeta = getPersonas().find((p) => p.id === persona);
      const rec = computeRecommendation(persona, state.results, getLadder(), getScenesConfig());
      const env = getEnv();

      const wrap = document.createElement('section');
      wrap.className = 'rm-shelf skin-clear';
      wrap.dataset.screen = 'staff';

      const heading = document.createElement('h1');
      heading.className = 'type-title stage-window';
      heading.textContent = ctx.t('staff.title');

      const useLine = document.createElement('p');
      useLine.className = 'type-body';
      const personaLabel = personaMeta ? (lang === 'hi' ? personaMeta.hi : personaMeta.en) : persona;
      useLine.textContent = `${ctx.t('staff.line.use')} ${personaLabel}`;

      const asksList = document.createElement('ul');
      asksList.className = 'rm-ask-list';
      for (const askKey of rec.asks) {
        const li = document.createElement('li');
        li.textContent = ctx.t(askKey);
        asksList.appendChild(li);
      }

      wrap.append(heading, useLine, asksList);

      if (env.nextStepUrl) {
        const qrLabel = document.createElement('p');
        qrLabel.className = 'type-body';
        qrLabel.textContent = ctx.t('staff.line.qr');

        const qrBox = document.createElement('div');
        qrBox.className = 'rm-qr-box';
        qrBox.dataset.testid = 'staff-qr';
        qrBox.appendChild(renderQrSvg(env.nextStepUrl, ctx.t('staff.line.qr')));
        wrap.append(qrLabel, qrBox);
      } else {
        const notConfigured = document.createElement('p');
        notConfigured.className = 'rm-not-configured type-body';
        notConfigured.dataset.testid = 'staff-qr-not-configured';
        notConfigured.textContent = 'not_configured: VITE_NEXT_STEP_URL';
        wrap.appendChild(notConfigured);
      }

      const actions = document.createElement('div');
      actions.className = 'rm-controls';
      actions.append(
        createButton({
          label: ctx.t('btn.again'),
          onClick: onReset,
        }),
      );
      wrap.appendChild(actions);

      root.replaceChildren(wrap);
      return () => {};
    },
  };
}
