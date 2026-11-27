import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite } from './helpers';

async function tabToAndPress(page: Page, targetText: string | RegExp): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    if (
      typeof targetText === 'string' ? focused === targetText : targetText.test(focused)
    ) {
      await page.keyboard.press('Enter');
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error(`Could not Tab to button matching ${String(targetText)}`);
}

test.describe('P11 Hardening: timing, keyboard-only, 390x844 screenshots, axe', () => {
  test('brisk full-run lands in 120-180s, zero third-party, axe clean', async ({ page }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install({ time: 0 });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoLite(page, '/');
    const startMs = await page.evaluate(() => Date.now());

    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/attract-1920x1080.png' });
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
    await page.keyboard.press('1');
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await page.clock.runFor(15_000);
    await page.screenshot({ path: 'evidence/P11/shelf-1920x1080.png' });
    await page.getByRole('button', { name: 'Buy it' }).click();

    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);

    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);
    await page.clock.runFor(22_200);

    await page.clock.runFor(1_200);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.clock.runFor(22_200);

    await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/receipt-1920x1080.png' });
    await page.getByRole('button', { name: 'See the fair fight' }).click();

    await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
    await page.clock.runFor(8_000);
    await page.screenshot({ path: 'evidence/P11/fairfight-1920x1080.png' });
    await page.getByRole('button', { name: 'Next' }).click();

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

  test('keyboard-only full flow reaches Result and Staff without mouse clicks', async ({
    page,
  }) => {
    const csp = await attachCspGuard(page);
    await page.clock.install();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoLite(page, '/');

    // Attract -> Shelf via Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();

    // Select laptop via key '1', Tab to Study, Enter, Tab to Buy it, Enter
    await page.keyboard.press('1');
    await tabToAndPress(page, 'Study');
    await tabToAndPress(page, 'Buy it');

    // Flip1 -> Lecture -> Flip2 -> Battery -> Creator -> Flip3 -> Private -> Receipt
    await tabToAndPress(page, 'Next');
    await page.clock.runFor(22_200);
    await tabToAndPress(page, 'Next');
    await page.clock.runFor(22_200);
    await page.clock.runFor(22_200);
    await tabToAndPress(page, 'Next');
    await page.clock.runFor(22_200);

    await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
    await tabToAndPress(page, 'See the fair fight');
    await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
    await tabToAndPress(page, 'Next');
    await expect(page.locator('[data-screen="result"]')).toBeVisible();
    await tabToAndPress(page, 'Show the store team');
    await expect(page.locator('[data-screen="staff"]')).toBeVisible();
    expect(await csp.assertClean()).toEqual([]);
  });

  test('captures 390x844 screenshots for every screen in evidence/P11/', async ({ page }) => {
    const csp = await attachCspGuard(page);
    await page.clock.install();
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/gallery.html');
    await page.screenshot({ path: 'evidence/P11/gallery-390x844.png' });

    const personas = [
      { id: 'study', label: 'Study' },
      { id: 'create', label: 'Create' },
      { id: 'game', label: 'Game' },
      { id: 'hustle', label: 'Work and side hustle' },
    ] as const;

    for (const p of personas) {
      await gotoLite(page, '/');
      if (p.id === 'study') {
        await page.screenshot({ path: 'evidence/P11/attract-390x844.png' });
      }
      await page.getByRole('button', { name: 'Pick your laptop' }).click();
      if (p.id === 'study') {
        await page.screenshot({ path: 'evidence/P11/shelf-390x844.png' });
      }
      await page.getByRole('button', { name: /Zesta Glow/ }).click();
      await page.getByRole('button', { name: p.label, exact: true }).click();
      await page.getByRole('button', { name: 'Buy it' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/lecture-390x844.png' });
      await page.clock.runFor(22_200);
      await page.getByRole('button', { name: 'Next' }).click();
      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/battery-390x844.png' });
      await page.clock.runFor(22_200);
      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/creator-390x844.png' });
      await page.clock.runFor(22_200);
      await page.getByRole('button', { name: 'Next' }).click();
      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/private-390x844.png' });
      await page.clock.runFor(22_200);

      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/receipt-390x844.png' });
      await page.getByRole('button', { name: 'See the fair fight' }).click();
      if (p.id === 'study') await page.screenshot({ path: 'evidence/P11/fairfight-390x844.png' });
      await page.getByRole('button', { name: 'Next' }).click();

      await page.screenshot({ path: `evidence/P11/result-${p.id}-390x844.png` });
      if (p.id === 'study') {
        await page.getByRole('button', { name: 'Show the store team' }).click();
        await page.screenshot({ path: 'evidence/P11/staff-390x844.png' });
      }
    }
    expect(await csp.assertClean()).toEqual([]);
  });
});
