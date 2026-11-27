import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
] as const;

test.describe('P13 Neo-Brutalist overhaul, juice & Clear-skin fix', () => {
  for (const vp of VIEWPORTS) {
    test(`captures Attract, Shelf, Gallery, Result in evidence/P13/ and verifies Clear-skin + laptops (${vp.width}x${vp.height})`, async ({
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

      await page.goto('/gallery.html');
      await expect(page.getByRole('heading', { name: 'Component Gallery' })).toBeVisible();
      await expect(page.locator('[data-cracked="true"]').first()).toBeVisible();
      await page.screenshot({ path: `evidence/P13/gallery-${vp.width}x${vp.height}.png` });

      await page.goto('/');
      await expect(page.locator('[data-screen="attract"]')).toBeVisible();
      const pattern = await page.locator('.rm-shell').evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(pattern).toContain('radial-gradient');
      await page.screenshot({ path: `evidence/P13/attract-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
      await expect(page.locator('.rm-laptop-bezel').first()).toBeVisible();
      await expect(page.locator('.rm-laptop-deck').first()).toBeVisible();

      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await expect(page.locator('.rm-btn--buy')).not.toHaveAttribute('aria-disabled', 'true');
      await page.screenshot({ path: `evidence/P13/shelf-${vp.width}x${vp.height}.png` });

      await page.locator('.rm-btn--buy').click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(22_200);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(22_200);
      await page.clock.runFor(22_200);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(22_200);

      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();

      const clearStyles = await page.locator('.rm-shell').evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          sat: cs.getPropertyValue('--sat').trim(),
          dim: cs.getPropertyValue('--dim').trim(),
          bgColor: cs.backgroundColor,
          filter: cs.filter,
          hasClear: el.classList.contains('skin-clear'),
        };
      });
      expect(clearStyles.hasClear).toBe(true);
      expect(clearStyles.sat).toBe('1');
      expect(clearStyles.dim).toBe('1');
      expect(clearStyles.bgColor).toBe('rgb(238, 243, 250)');
      expect(clearStyles.filter).toBe('none');

      const axeRes = await new AxeBuilder({ page }).analyze();
      console.log(`AXE_P13_RESULT[${vp.width}x${vp.height}]=` + JSON.stringify(axeRes.violations.map((v) => v.id)));
      expect(axeRes.violations).toEqual([]);

      await page.screenshot({ path: `evidence/P13/result-${vp.width}x${vp.height}.png` });
      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
