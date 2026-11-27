import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

const FIT_VIEWPORTS = [
  { width: 1536, height: 730, saveEvidence: true },
  { width: 1280, height: 640, saveEvidence: true },
  { width: 1366, height: 768, saveEvidence: false },
] as const;

test.describe('v1.2 Viewport fit (no vertical scroll >= 1280x640) & Attract tag bounds', () => {
  for (const vp of FIT_VIEWPORTS) {
    test(`Attract and Shelf fit with zero vertical scroll and Buy it in viewport (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') {
          thirdParty.push(req.url());
        }
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.locator('[data-screen="attract"]')).toBeVisible();

      const attractFit = await page.evaluate(() => ({
        scrollH: document.documentElement.scrollHeight,
        innerH: window.innerHeight,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      expect(attractFit.scrollH).toBeLessThanOrEqual(attractFit.innerH);
      expect(attractFit.scrollW).toBeLessThanOrEqual(attractFit.innerW);

      const tags = page.locator('.rm-marquee .rm-pricetag');
      await expect(tags).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const box = await tags.nth(i).boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.y).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
          expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
        }
      }

      if (vp.saveEvidence) {
        await page.screenshot({ path: `evidence/v1.2/attract-${vp.width}x${vp.height}.png` });
      }

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await expect(page.locator('[data-screen="shelf"]')).toBeVisible();

      const shelfFit = await page.evaluate(() => ({
        scrollH: document.documentElement.scrollHeight,
        innerH: window.innerHeight,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      expect(shelfFit.scrollH, `Shelf vertical overflow at ${vp.width}x${vp.height}`).toBeLessThanOrEqual(
        shelfFit.innerH,
      );
      expect(shelfFit.scrollW).toBeLessThanOrEqual(shelfFit.innerW);

      const buyBox = await page.getByRole('button', { name: 'Buy it' }).boundingBox();
      expect(buyBox).not.toBeNull();
      if (buyBox) {
        expect(buyBox.y).toBeGreaterThanOrEqual(0);
        expect(buyBox.y + buyBox.height).toBeLessThanOrEqual(vp.height);
      }

      const chipBox = await page.getByRole('button', { name: 'Work and side hustle' }).boundingBox();
      expect(chipBox).not.toBeNull();
      if (chipBox) {
        expect(chipBox.y + chipBox.height).toBeLessThanOrEqual(vp.height);
      }

      if (vp.saveEvidence) {
        await page.screenshot({ path: `evidence/v1.2/shelf-${vp.width}x${vp.height}.png` });
      }

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
