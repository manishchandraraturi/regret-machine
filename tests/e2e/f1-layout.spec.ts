import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite } from './helpers';

const VIEWPORTS = [
  { width: 2560, height: 1300 },
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
] as const;

test.describe('F1 Layout polish: centered stage, marquee fade, Attract hero', () => {
  for (const vp of VIEWPORTS) {
    test(`renders centered stage, hero laptop, fade mask & screenshots (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') {
          thirdParty.push(req.url());
        }
      });

      await page.clock.install();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoLite(page, '/');

      await expect(page.locator('[data-screen="attract"]')).toBeVisible();
      await expect(page.locator('.rm-attract-visual .rm-laptop--pink')).toBeVisible();
      await expect(page.locator('.rm-attract-starburst')).toBeVisible();

      if (vp.width >= 1200) {
        const shellBox = await page.locator('.rm-shell').boundingBox();
        expect(shellBox).not.toBeNull();
        if (shellBox) {
          expect(shellBox.width).toBeLessThanOrEqual(1920);
          if (vp.width === 2560) {
            expect(shellBox.x).toBeGreaterThan(250);
            expect(shellBox.y).toBeGreaterThan(50);
          }
        }
        const wordSize = await page
          .locator('.rm-wordmark')
          .evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
        if (vp.width >= 1920) {
          expect(wordSize).toBeGreaterThanOrEqual(46);
          expect(wordSize).toBeLessThanOrEqual(50);
        }
        const tags = page.locator('.rm-marquee .rm-pricetag');
        await expect(tags).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
          const tBox = await tags.nth(i).boundingBox();
          expect(tBox).not.toBeNull();
          if (tBox) {
            expect(tBox.x).toBeGreaterThanOrEqual(0);
            expect(tBox.x + tBox.width).toBeLessThanOrEqual(vp.width);
          }
        }
      }

      if (vp.width === 390) {
        const ow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        expect(ow).toBe(true);
      }

      const axeAttract = await new AxeBuilder({ page }).analyze();
      console.log(`AXE_F1_ATTRACT[${vp.width}x${vp.height}]=` + JSON.stringify(axeAttract.violations.map((v) => v.id)));
      expect(axeAttract.violations).toEqual([]);
      await page.screenshot({ path: `evidence/F1/attract-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await page.screenshot({ path: `evidence/F1/shelf-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Buy it' }).click();
      await page.keyboard.press('Space');
      await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
      await page.screenshot({ path: `evidence/F1/lecture-play-${vp.width}x${vp.height}.png` });

      await page.clock.runFor(16_500);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await page.screenshot({ path: `evidence/F1/lecture-reveal-${vp.width}x${vp.height}.png` });

      await page.clock.runFor(6_000);
      await page.keyboard.press('Space');
      await page.clock.runFor(22_200);
      await page.clock.runFor(22_200);
      await page.keyboard.press('Space');
      await page.clock.runFor(22_200);

      await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
      await page.clock.runFor(2_000);
      await page.screenshot({ path: `evidence/F1/receipt-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
      const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bodyBg).toBe('rgb(238, 243, 250)');
      await page.screenshot({ path: `evidence/F1/fairfight-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();
      await page.screenshot({ path: `evidence/F1/result-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Show the store team' }).click();
      await expect(page.locator('[data-screen="staff"]')).toBeVisible();
      await page.screenshot({ path: `evidence/F1/staff-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
