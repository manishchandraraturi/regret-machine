import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { analyzeAxeOnPausedClock, gotoLite, runClockUntilVisible, withPausedClock } from './helpers';

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

      await page.clock.install({ time: 0 });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoLite(page, '/');

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();
      await page.keyboard.press('Space');

      await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
      await page.clock.runFor(2_000);
      await page.getByRole('button', { name: '#1' }).click();
      const axePlay = await withPausedClock(page, async () => {
        await page.screenshot({ path: `evidence/P7/play-${vp.width}x${vp.height}.png` });
        return analyzeAxeOnPausedClock(page);
      });
      console.log(
        `AXE_P7_PLAY[${vp.name}]=` +
          JSON.stringify(axePlay.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axePlay.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      await runClockUntilVisible(page, '[data-testid="wifi-drop-banner"]', 10_000, 250);
      await expect(page.getByTestId('wifi-drop-banner')).toBeVisible();
      await withPausedClock(page, async () => {
        await page.screenshot({ path: `evidence/P7/wifi-drop-${vp.width}x${vp.height}.png` });
      });

      await runClockUntilVisible(page, '[data-phase="REVEAL"]', 12_000, 250);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Illustration');
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Intel-claimed, up to');
      const axeReveal = await withPausedClock(page, async () => {
        await page.getByRole('button', { name: 'Details' }).click();
        await expect(page.locator('.rm-claim-sheet')).toContainText('NPU:');
        await page.getByRole('button', { name: 'Close' }).click();
        await page.screenshot({ path: `evidence/P7/reveal-${vp.width}x${vp.height}.png` });
        return analyzeAxeOnPausedClock(page);
      });
      console.log(
        `AXE_P7_REVEAL[${vp.name}]=` +
          JSON.stringify(axeReveal.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axeReveal.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      // Auto-completes at 22s total -> moves to flip2 (which auto-advances in 1.6s)
      await runClockUntilVisible(page, '[data-screen="flip"]', 8_000, 250);
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();

      // Hindi reveal screenshot
      await gotoLite(page, '/?lang=hi');
      await page.getByRole('button', { name: 'अपना लैपटॉप चुनो' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'पढ़ाई', exact: true }).click();
      await page.getByRole('button', { name: 'खरीद लो' }).click();
      await page.keyboard.press('Space');
      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await page.screenshot({ path: `evidence/P7/reveal-hi-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
