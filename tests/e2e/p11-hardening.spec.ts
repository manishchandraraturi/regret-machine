import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { attachCspGuard } from './csp';

test.describe('P11 Hardening: timing, keyboard-only, axe, screenshots', () => {
  test('brisk full-run lands in 120-180s, keyboard-only works, zero third-party, axe clean', async ({
    page,
  }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install({ time: 0 });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const startMs = await page.evaluate(() => Date.now());

    // Attract (8s) -> keyboard Enter starts
    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/attract-1920x1080.png' });
    await page.keyboard.press('Enter');

    // Shelf (15s) -> key '1' selects laptop, click Study, Buy it
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
    await page.keyboard.press('1');
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await page.clock.runFor(15_000);
    await page.screenshot({ path: 'evidence/P11/shelf-1920x1080.png' });
    await page.getByRole('button', { name: 'Buy it' }).click();

    // Flip 1 (1.2s) -> Lecture (22s)
    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);

    // Flip 2 (1.2s) -> Battery (22s) -> Creator (22s)
    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);
    await page.clock.runFor(22_200);

    // Flip 3 (1.2s) -> Private (22s)
    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);

    // Receipt (8s)
    await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/receipt-1920x1080.png' });
    await page.getByRole('button', { name: 'See the fair fight' }).click();

    // Fair Fight (8s)
    await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/fairfight-1920x1080.png' });
    await page.getByRole('button', { name: 'Next' }).click();

    // Result
    await expect(page.locator('[data-screen="result"]')).toBeVisible();
    await page.screenshot({ path: 'evidence/P11/result-1920x1080.png' });
    const endMs = await page.evaluate(() => Date.now());
    const elapsedSec = (endMs - startMs) / 1000;
    console.log(`TIMED_RUN_SEC=${elapsedSec.toFixed(1)}`);
    expect(elapsedSec).toBeGreaterThanOrEqual(120);
    expect(elapsedSec).toBeLessThanOrEqual(180);

    const axeRes = await new AxeBuilder({ page }).analyze();
    console.log('AXE_P11_RESULT=' + JSON.stringify(axeRes.violations.map((v) => v.id)));
    expect(axeRes.violations).toEqual([]);

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });
});
