import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

export type AxeAnalyzeResult = Awaited<ReturnType<AxeBuilder['analyze']>>;

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

export async function withPausedClock<T>(page: Page, fn: () => Promise<T>): Promise<T> {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 100);
  try {
    return await fn();
  } finally {
    await page.clock.resume();
  }
}

export async function analyzeAxeOnPausedClock(page: Page): Promise<AxeAnalyzeResult> {
  let done = false;
  const pending = new AxeBuilder({ page }).analyze().finally(() => {
    done = true;
  });
  while (!done) {
    await page.clock.runFor(1);
    await new Promise((r) => setTimeout(r, 20));
  }
  return pending;
}
