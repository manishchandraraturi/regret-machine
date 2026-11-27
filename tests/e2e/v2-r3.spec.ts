import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';
import { runClockUntilVisible } from './helpers';

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 730 },
  { width: 390, height: 844 },
] as const;

test.describe('V2 R3 Three.js showroom & fallback', () => {
  for (const vp of VIEWPORTS) {
    test(`renders lazy WebGL2 stage3d on Attract, Shelf, Result (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      const thirdParty: string[] = [];
      const csp = await attachCspGuard(page);
      page.on('request', (req) => {
        if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
      });

      await page.clock.install({ time: 0 });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/?perf=1');

      await expect(page.locator('[data-screen="attract"]')).toBeVisible();
      await page.clock.runFor(100);
      await expect(page.locator('#app[data-stage-mode="webgl2"]')).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('canvas#stage3d.rm-stage3d--ready')).toBeVisible();
      await page.clock.runFor(650);
      if (vp.width === 1536) {
        console.log('PERF_ATTRACT=' + (await page.getByTestId('perf-overlay').textContent()));
      }
      await page.screenshot({ path: `evidence/V2-r3/attract-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: 'Study', exact: true }).click();
      await page.clock.runFor(450);
      await page.screenshot({ path: `evidence/V2-r3/shelf-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'Buy it' }).click();
      await expect(page.locator('[data-screen="flip"]')).toBeVisible();
      await expect(page.locator('[data-screen="flip"] .stage-window')).toBeAttached();
      await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
      await page.clock.runFor(450);
      await page.screenshot({ path: `evidence/U1/flip-${vp.width}x${vp.height}.png` });
      await page.clock.runFor(1_400);

      await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
      await page.clock.runFor(600);
      if (vp.width === 1536) {
        console.log('PERF_SCENE=' + (await page.getByTestId('perf-overlay').textContent()));
      }
      await page.screenshot({ path: `evidence/U1/lecture-play-${vp.width}x${vp.height}.png` });
      await runClockUntilVisible(page, '[data-phase="REVEAL"]', 18_000);
      await expect(page.locator('[data-phase="REVEAL"]')).toBeVisible();
      await expect(page.locator('[data-screen="lecture"] .stage-window')).toBeAttached();
      await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
      await page.clock.runFor(450);
      if (vp.width === 1536) {
        console.log('PERF_REVEAL=' + (await page.getByTestId('perf-overlay').textContent()));
      }
      await page.screenshot({ path: `evidence/U1/reveal-${vp.width}x${vp.height}.png` });

      await runClockUntilVisible(page, '[data-screen="battery"]', 10_000);
      await expect(page.locator('[data-screen="battery"]')).toBeVisible();
      await page.clock.runFor(2_000);
      await page.screenshot({ path: `evidence/U1/battery-play-${vp.width}x${vp.height}.png` });
      await runClockUntilVisible(page, '[data-screen="creator"]', 25_000);
      await page.keyboard.press('ArrowRight');
      await runClockUntilVisible(page, '[data-screen="private"]', 26_000);
      await page.keyboard.press('ArrowRight');
      await runClockUntilVisible(page, '[data-screen="receipt"]', 26_000);
      await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
      await page.clock.runFor(1_500);
      await page.screenshot({ path: `evidence/U6/receipt-${vp.width}x${vp.height}.png` });

      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
      await page.clock.runFor(450);
      await page.screenshot({ path: `evidence/U6/fairfight-${vp.width}x${vp.height}.png` });
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();
      await page.clock.runFor(450);
      await page.screenshot({ path: `evidence/U6/result-${vp.width}x${vp.height}.png` });

      if (vp.width === 1920) {
        const axeRes = await new AxeBuilder({ page }).analyze();
        console.log('AXE_V2_R3_RESULT=' + JSON.stringify(axeRes.violations.map((v) => v.id)));
        expect(axeRes.violations).toEqual([]);
      }

      expect(thirdParty).toEqual([]);
      expect(await csp.assertClean()).toEqual([]);
    });
  }

  test('?lite=1 skips Three.js chunk and uses shaded DOM fallback with full flow green', async ({
    page,
  }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install({ time: 0 });
    await page.setViewportSize({ width: 1280, height: 640 });
    await page.goto('/?lite=1');

    await expect(page.locator('#app[data-stage-mode="fallback"]')).toBeVisible();
    await expect(page.locator('#app')).toHaveAttribute('data-stage-reason', 'lite');
    await expect(page.locator('canvas#stage3d')).toHaveCount(0);
    await expect(page.locator('.rm-attract-visual .rm-laptop--pink')).toBeVisible();
    await page.screenshot({ path: 'evidence/V2-r3/fallback-lite-1280x640.png' });

    await page.getByRole('button', { name: 'Pick your laptop' }).click();
    await page.getByRole('button', { name: /Zesta Glow/ }).click();
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await page.getByRole('button', { name: 'Buy it' }).click();
    await expect(page.locator('[data-screen="flip"]')).toBeVisible();

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });
});
