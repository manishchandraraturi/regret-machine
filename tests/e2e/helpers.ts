import type { Page } from '@playwright/test';

export function withLiteParam(path = '/'): string {
  const url = new URL(path, 'http://127.0.0.1:4173');
  if (!url.searchParams.has('lite')) {
    url.searchParams.set('lite', '1');
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export async function gotoLite(page: Page, path = '/'): Promise<void> {
  await page.goto(withLiteParam(path));
}

export async function runClockUntilVisible(
  page: Page,
  selector: string,
  maxMs = 20_000,
  stepMs = 500,
): Promise<void> {
  const loc = page.locator(selector);
  for (let elapsed = 0; elapsed <= maxMs; elapsed += stepMs) {
    if (await loc.isVisible().catch(() => false)) return;
    await page.clock.runFor(stepMs);
  }
}
