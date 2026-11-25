import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P8 Private files (privacy)', () => {
  for (const vp of VIEWPORTS) {
    test(`runs 22s, shows upload banner, on-device reveal, tags, receipt line, axe (${vp.name})`, async ({
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
      await page.getByRole('button', { name: 'Work and side hustle', exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();

      // Skip through flip1 -> lecture -> flip2 -> battery -> creator -> flip3 -> private
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Skip this scene' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.locator('[data-screen="private"]')).toBeVisible();
      await expect(page.getByTestId('upload-banner')).toBeVisible();
      await page.getByRole('button', { name: 'Keep private' }).click();
      await page.screenshot({ path: `evidence/P8/play-${vp.width}x${vp.height}.png` });
      await page.getByTestId('upload-banner').screenshot({
        path: `evidence/P8/upload-banner-${vp.width}x${vp.height}.png`,
      });

      const axePlay = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P8_PLAY[${vp.name}]=` +
          JSON.stringify(axePlay.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axePlay.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('can run on your laptop');
      await expect(page.locator('[data-phase="REVEAL"]')).toContainText('Illustration');
      await page.screenshot({ path: `evidence/P8/reveal-${vp.width}x${vp.height}.png` });

      const axeReveal = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P8_REVEAL[${vp.name}]=` +
          JSON.stringify(axeReveal.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axeReveal.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      // Auto-completes at 22s total -> moves to receipt
      await page.clock.runFor(6_000);
      await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
      await page.clock.runFor(2_500);
      await expect(page.locator('.rm-tape')).toContainText('Private files had to be uploaded');

      // Hindi reveal screenshot
      await page.goto('/?lang=hi');
      await page.getByRole('button', { name: 'अपना लैपटॉप चुनो' }).click();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'काम और साइड हसल', exact: true }).click();
      await page.getByRole('button', { name: 'खरीद लो' }).click();
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.locator('[data-stub="true"] button').click();
      await page.getByRole('button', { name: 'आगे' }).click();
      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await page.screenshot({ path: `evidence/P8/reveal-hi-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
