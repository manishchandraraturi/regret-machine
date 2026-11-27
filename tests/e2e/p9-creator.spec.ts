import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite, runClockUntilVisible } from './helpers';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P9 Creator night (performance) = CUT LINE 3', () => {
  for (const vp of VIEWPORTS) {
    test(`runs 22s, shows stutter, baseline text, tags, all 4 receipt lines, axe (${vp.name})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        const url = new URL(req.url());
        if (url.origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
      });

      await page.clock.install();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoLite(page, '/');

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Create', exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();

      // flip1 -> lecture -> flip2 -> battery -> creator
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await page.keyboard.press('Space');
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await page.keyboard.press('Space');

      await expect(page.locator('[data-screen="creator"]')).toBeVisible();
      await page.getByTestId('creator-hold-btn').dispatchEvent('pointerdown');
      await page.clock.runFor(3_000);
      await page.screenshot({ path: `evidence/P9/play-${vp.width}x${vp.height}.png` });

      const axePlay = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P9_PLAY[${vp.name}]=` +
          JSON.stringify(axePlay.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axePlay.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      await runClockUntilVisible(page, '[data-testid="creator-stutter"]', 10_000);
      await expect(page.getByTestId('creator-stutter')).toBeVisible();
      await page.screenshot({ path: `evidence/P9/stutter-${vp.width}x${vp.height}.png` });

      await runClockUntilVisible(page, '[data-phase="REVEAL"]', 12_000);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Illustration');
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Intel-claimed, up to');
      await page.getByRole('button', { name: 'Details' }).click();
      await expect(page.getByTestId('creator-baseline')).toContainText(
        'vs earlier-generation Intel chip, Intel-measured',
      );
      await page.getByRole('button', { name: 'Close' }).click();
      await page.screenshot({ path: `evidence/P9/reveal-${vp.width}x${vp.height}.png` });

      const axeReveal = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P9_REVEAL[${vp.name}]=` +
          JSON.stringify(axeReveal.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axeReveal.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      // Auto-completes at 22s -> flip3 -> private -> receipt
      await page.clock.runFor(6_000);
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await page.keyboard.press('Space');
      await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
      await page.clock.runFor(3_000);

      const tape = page.locator('.rm-tape');
      await expect(tape).toContainText('Lecture summary lost: needs internet');
      await expect(tape).toContainText('Dead battery at 2:30 pm');
      await expect(tape).toContainText('Reel late: laptop stuttered');
      await expect(tape).toContainText('Private files had to be uploaded');

      // Hindi reveal screenshot
      await gotoLite(page, '/?lang=hi');
      await page.getByRole('button', { name: 'अपना लैपटॉप चुनो' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'क्रिएट करना', exact: true }).click();
      await page.getByRole('button', { name: 'खरीद लो' }).click();
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await page.keyboard.press('Space');
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await page.screenshot({ path: `evidence/P9/reveal-hi-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
