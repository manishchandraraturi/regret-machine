import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P0 smoke', () => {
  for (const vp of VIEWPORTS) {
    test(`renders title and health with zero third-party requests (${vp.name})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const pageErrors: string[] = [];
      const csp = await attachCspGuard(page);

      page.on('request', (req) => {
        const url = new URL(req.url());
        if (url.origin !== 'http://127.0.0.1:4173') {
          thirdParty.push(req.url());
        }
      });
      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'The Regret Machine' })).toBeVisible();
      await page.screenshot({ path: `evidence/P0/title-${vp.width}x${vp.height}.png` });

      await page.goto('/health.html');
      await expect(page.locator('body')).toContainText('ok');
      await page.screenshot({ path: `evidence/P0/health-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
