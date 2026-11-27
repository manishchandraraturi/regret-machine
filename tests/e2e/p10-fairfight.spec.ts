import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite } from './helpers';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P10 Fair Fight & Hindi 390px pass', () => {
  for (const vp of VIEWPORTS) {
    test(`Fair Fight shows source ids, 2+ concessions, no Hindi overflow at 390px, axe (${vp.name})`, async ({
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
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await page.clock.runFor(16_500);
      await page.getByRole('button', { name: 'Next' }).click();

      await page.getByRole('button', { name: 'See the fair fight' }).click();
      const ff = page.locator('[data-screen="fairfight"]');
      await expect(ff).toBeVisible();
      await expect(ff).toContainText('C-10');
      await expect(ff).toContainText('C-12');
      await expect(ff).toContainText('C-13');
      await expect(ff).toContainText('(unconfirmed)');
      expect(await ff.locator('[data-concession="true"]').count()).toBeGreaterThanOrEqual(2);
      await page.screenshot({ path: `evidence/P10/fairfight-${vp.width}x${vp.height}.png` });

      const axeFf = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_P10_FAIRFIGHT[${vp.name}]=` +
          JSON.stringify(axeFf.violations.map((v) => ({ id: v.id, impact: v.impact }))),
      );
      expect(axeFf.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);

      // Switch to Hindi on Fair Fight and check no horizontal overflow
      await page.getByRole('button', { name: 'हिन्दी' }).click();
      const overflowWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(overflowWidth).toBeLessThanOrEqual(vp.width);
      await page.screenshot({ path: `evidence/P10/fairfight-hi-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'आगे' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();
      const resultOverflow = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(resultOverflow).toBeLessThanOrEqual(vp.width);
      await page.screenshot({ path: `evidence/P10/result-after-ff-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
