import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite } from './helpers';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P4 Attract & Shelf', () => {
  for (const vp of VIEWPORTS) {
    test(`Attract -> Shelf -> selection -> Hindi toggle -> YearFlip (${vp.name})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        const url = new URL(req.url());
        if (url.origin !== 'http://127.0.0.1:4173') {
          thirdParty.push(req.url());
        }
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      const t0 = Date.now();
      await gotoLite(page, '/');
      const cta = page.getByRole('button', { name: 'Pick your laptop' });
      await expect(cta).toBeVisible();
      expect(Date.now() - t0).toBeLessThan(2000);
      await page.screenshot({ path: `evidence/P4/attract-${vp.width}x${vp.height}.png` });

      await cta.click();
      await expect(page.getByRole('heading', { name: 'Which one are you taking home?' })).toBeVisible();
      await page.screenshot({ path: `evidence/P4/shelf-${vp.width}x${vp.height}.png` });

      const buyBtn = page.getByRole('button', { name: 'Buy it' });
      await expect(buyBtn).toHaveAttribute('aria-disabled', 'true');

      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await expect(buyBtn).toHaveAttribute('aria-disabled', 'true');

      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await expect(buyBtn).not.toHaveAttribute('aria-disabled', 'true');
      await page.screenshot({ path: `evidence/P4/shelf-selected-${vp.width}x${vp.height}.png` });

      // Language toggle mid-flow keeps selection state
      await page.getByRole('button', { name: 'हिन्दी' }).click();
      await expect(page.getByRole('button', { name: 'खरीद लो' })).not.toHaveAttribute(
        'aria-disabled',
        'true',
      );
      await page.screenshot({ path: `evidence/P4/shelf-hi-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'खरीद लो' }).click();
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }

  test('idle 60s returns to Attract and clears state; facilitator bar skips', async ({ page }) => {
    const csp = await attachCspGuard(page);
    await page.clock.install();
    await gotoLite(page, '/?facilitator=1');

    await page.getByRole('button', { name: 'Pick your laptop' }).click();
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();

    await page.clock.runFor(61_000);
    await expect(page.locator('[data-screen="attract"]')).toBeVisible();

    await expect(page.getByTestId('facilitator-bar')).toBeVisible();
    await page.getByRole('button', { name: 'Skip this scene' }).click();
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
    expect(await csp.assertClean()).toEqual([]);
  });
});
