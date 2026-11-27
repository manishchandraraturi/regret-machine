import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { attachCspGuard } from './csp';

const R1_VIEWPORTS = [
  { width: 2560, height: 1300 },
  { width: 1920, height: 1080 },
  { width: 1536, height: 730 },
  { width: 1366, height: 768 },
  { width: 1280, height: 640 },
  { width: 390, height: 844 },
] as const;

async function assertScreenFit(page: Page, screen: string, width: number): Promise<void> {
  const fit = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    scrollH: document.documentElement.scrollHeight,
    innerH: window.innerHeight,
  }));
  expect(fit.scrollW, `${screen} ${width}w horiz overflow`).toBeLessThanOrEqual(fit.innerW);
  if (width >= 1280) {
    expect(fit.scrollH, `${screen} ${width}w vert overflow`).toBeLessThanOrEqual(fit.innerH);
  }
}

test.describe('V2 R1 palette, layout fit & screen screenshots', () => {
  for (const vp of R1_VIEWPORTS) {
    test(`captures all screens & checks zero overflow (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
      });

      await page.clock.install();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      await expect(page.locator('[data-screen="attract"]')).toBeVisible();
      await expect(page.locator('.rm-laptop-hinge').first()).toBeVisible();
      await expect(page.locator('.rm-laptop-keys').first()).toBeVisible();
      await assertScreenFit(page, 'attract', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/attract-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await assertScreenFit(page, 'shelf', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/shelf-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Buy it' }).click();
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();
      await assertScreenFit(page, 'flip1', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/flip1-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
      await assertScreenFit(page, 'lecture-play', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/lecture-play-${vp.width}x${vp.height}.png` });

      await page.clock.runFor(16_500);
      await expect(page.locator('.rm-split')).toBeVisible();
      await assertScreenFit(page, 'lecture-reveal', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/lecture-reveal-${vp.width}x${vp.height}.png` });

      await page.clock.runFor(6_000);
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="battery"]')).toBeVisible();
      await assertScreenFit(page, 'battery-play', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/battery-play-${vp.width}x${vp.height}.png` });
      await page.clock.runFor(22_200);

      await expect(page.locator('[data-screen="creator"]')).toBeVisible();
      await assertScreenFit(page, 'creator-play', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/creator-play-${vp.width}x${vp.height}.png` });
      await page.clock.runFor(22_200);

      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="private"]')).toBeVisible();
      await assertScreenFit(page, 'private-play', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/private-play-${vp.width}x${vp.height}.png` });
      await page.clock.runFor(22_200);

      await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
      await page.clock.runFor(2_000);
      await assertScreenFit(page, 'receipt', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/receipt-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
      await assertScreenFit(page, 'fairfight', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/fairfight-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();
      await assertScreenFit(page, 'result', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/result-${vp.width}x${vp.height}.png` });

      if (vp.width === 1920 || vp.width === 390) {
        const axeRes = await new AxeBuilder({ page }).analyze();
        console.log(`AXE_V2_R1_RESULT[${vp.width}x${vp.height}]=` + JSON.stringify(axeRes.violations.map((v) => v.id)));
        expect(axeRes.violations).toEqual([]);
      }

      await page.getByRole('button', { name: 'Show the store team' }).click();
      await expect(page.locator('[data-screen="staff"]')).toBeVisible();
      await assertScreenFit(page, 'staff', vp.width);
      await page.screenshot({ path: `evidence/V2-r1/staff-${vp.width}x${vp.height}.png` });

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }
});
