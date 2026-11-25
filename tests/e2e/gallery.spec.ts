import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.describe('P1 gallery', () => {
  for (const vp of VIEWPORTS) {
    test(`renders gallery, self-hosted fonts, touch targets >= 48px, no Hindi clip (${vp.name})`, async ({
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
      await page.goto('/gallery.html');
      await expect(page.getByRole('heading', { name: 'Component Gallery' })).toBeVisible();

      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < Math.min(count, 12); i++) {
        const box = await buttons.nth(i).boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(48);
          expect(box.width).toBeGreaterThanOrEqual(48);
        }
      }

      const hiHeading = page.locator('[lang="hi"] .type-flyer');
      await expect(hiHeading).toBeVisible();
      const hiBox = await hiHeading.boundingBox();
      expect(hiBox).not.toBeNull();
      if (hiBox) {
        expect(hiBox.width).toBeLessThanOrEqual(vp.width);
      }

      if (vp.width === 1920) {
        await page
          .getByTestId('decay-strip')
          .screenshot({ path: 'evidence/P1/decay-strip-1920x1080.png' });
      }
      await page.screenshot({ path: `evidence/P1/gallery-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }

  test('honours prefers-reduced-motion on YearFlip', async ({ page }) => {
    const csp = await attachCspGuard(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/gallery.html');

    const flipBtn = page.getByRole('button', { name: 'Flip year' }).first();
    await flipBtn.click();
    await expect(page.locator('.rm-yearflip').first()).toContainText('Year 2');
    await page.screenshot({ path: 'evidence/P1/gallery-reduced-motion.png' });
    expect(await csp.assertClean()).toEqual([]);
  });
});
