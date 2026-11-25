import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P7 Lecture hall (on-device AI) = CUT LINE 2', () => {
  for (const vp of VIEWPORTS) {
    test(`runs 22s, triggers Wi-Fi drop, shows NPU gloss & reveal tags, axe (${vp.name})`, async ({
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
      await page.goto('/');

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
      await page.clock.runFor(2_000);
      await page.getByRole('button', { name: '#1' }).click();
      await page.screenshot({ path: `evidence/P7/play-${vp.width}x${vp.height}.png` });

      const axePlay = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P7_PLAY[${vp.name}]=` +
          JSON.stringify(axePlay.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axePlay.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      await page.clock.runFor(7_500);
      await expect(page.getByTestId('wifi-drop-banner')).toBeVisible();
      await page.screenshot({ path: `evidence/P7/wifi-drop-${vp.width}x${vp.height}.png` });

      await page.clock.runFor(7_000);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await expect(page.getByTestId('npu-gloss')).toBeVisible();
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Illustration');
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Intel-claimed, up to');
      await page.screenshot({ path: `evidence/P7/reveal-${vp.width}x${vp.height}.png` });

      const axeReveal = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P7_REVEAL[${vp.name}]=` +
          JSON.stringify(axeReveal.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axeReveal.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      // Auto-completes at 22s total -> moves to flip2
      await page.clock.runFor(6_000);
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();

      // Hindi reveal screenshot
      await page.goto('/?lang=hi');
      await page.getByRole('button', { name: 'अपना लैपटॉप चुनो' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'पढ़ाई', exact: true }).click();
      await page.getByRole('button', { name: 'खरीद लो' }).click();
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await page.screenshot({ path: `evidence/P7/reveal-hi-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
