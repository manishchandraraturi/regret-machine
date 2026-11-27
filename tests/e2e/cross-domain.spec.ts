import { expect, test, type Page } from '@playwright/test';
import { attachCspGuard } from './csp';
import { gotoLite } from './helpers';

async function tabToAndPress(page: Page, targetText: string | RegExp): Promise<void> {
  for (let i = 0; i < 35; i++) {
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
    if (typeof targetText === 'string' ? focused === targetText : targetText.test(focused)) {
      await page.keyboard.press('Enter');
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error(`Could not Tab to control matching ${String(targetText)}`);
}

async function assertNoHorizontalOverflow(page: Page, label: string): Promise<void> {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, `${label} horizontal overflow: ${scrollWidth} > ${innerWidth}`).toBeLessThanOrEqual(
    innerWidth,
  );
}

test.describe('Cross-domain verification', () => {
  test('hostile ?lang=xx falls back to en and ?facilitator=0 hides facilitator bar', async ({ page }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await gotoLite(page, '/?lang=xx&facilitator=0');
    await expect(page.locator('[data-screen="attract"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
    await expect(page.getByRole('button', { name: 'Pick your laptop' })).toBeVisible();
    await expect(page.locator('[data-testid="facilitator-bar"]')).toHaveCount(0);

    await gotoLite(page, '/?lang=%3Cscript%3Ealert(1)%3C%2Fscript%3E&facilitator=0');
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
    await expect(page.locator('[data-testid="facilitator-bar"]')).toHaveCount(0);

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });

  test('direct /health.html and /gallery.html load with zero CSP violations or third-party requests', async ({
    page,
  }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.goto('/health.html');
    await expect(page.locator('body')).toContainText('ok');

    await page.goto('/gallery.html');
    await expect(page.getByRole('heading', { name: 'Component Gallery' })).toBeVisible();

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });

  test('390x844 has no horizontal overflow, no CSP violations, and Staff shows not_configured across every route', async ({
    page,
  }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install();
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/gallery.html');
    await assertNoHorizontalOverflow(page, 'gallery');

    await gotoLite(page, '/');
    await expect(page.locator('[data-screen="attract"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'attract');

    await page.getByRole('button', { name: 'Pick your laptop' }).click();
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'shelf');

    await page.getByRole('button', { name: /Zesta Glow/ }).click();
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await page.getByRole('button', { name: 'Buy it' }).click();
    await page.keyboard.press('Space');

    await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'lecture');
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');

    await expect(page.locator('[data-screen="battery"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'battery');
    await page.clock.runFor(22_200);

    await expect(page.locator('[data-screen="creator"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'creator');
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');

    await expect(page.locator('[data-screen="private"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'private');
    await page.clock.runFor(22_200);

    await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'receipt');
    await page.getByRole('button', { name: 'See the fair fight' }).click();

    await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'fairfight');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.locator('[data-screen="result"]')).toBeVisible();
    await assertNoHorizontalOverflow(page, 'result');
    await page.getByRole('button', { name: 'Show the store team' }).click();

    await expect(page.locator('[data-screen="staff"]')).toBeVisible();
    await expect(page.getByTestId('staff-qr-not-configured')).toContainText('not_configured');
    await assertNoHorizontalOverflow(page, 'staff');

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });

  test('keyboard-only full flow reaches Staff and reduced-motion full flow reaches Result', async ({ page }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      if (new URL(req.url()).origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoLite(page, '/');

    await page.keyboard.press('Enter');
    await expect(page.locator('[data-screen="shelf"]')).toBeVisible();
    await page.keyboard.press('1');
    await tabToAndPress(page, 'Study');
    await tabToAndPress(page, 'Buy it');
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await tabToAndPress(page, 'See the fair fight');
    await tabToAndPress(page, 'Next');
    await tabToAndPress(page, 'Show the store team');
    await expect(page.locator('[data-screen="staff"]')).toBeVisible();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoLite(page, '/');
    await page.getByRole('button', { name: 'Pick your laptop' }).click();
    await page.getByRole('button', { name: /Zesta Glow/ }).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.getByRole('button', { name: 'Buy it' }).click();
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await page.clock.runFor(22_200);
    await page.keyboard.press('Space');
    await page.clock.runFor(22_200);
    await page.getByRole('button', { name: 'See the fair fight' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-screen="result"]')).toBeVisible();

    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });
});
