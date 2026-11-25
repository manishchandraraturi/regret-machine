import type { Page } from '@playwright/test';

export interface CspGuard {
  assertClean(): Promise<string[]>;
}

export async function attachCspGuard(page: Page): Promise<CspGuard> {
  const consoleErrors: string[] = [];

  await page.addInitScript(() => {
    const win = window as unknown as { __cspViolations?: string[] };
    win.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (ev) => {
      win.__cspViolations?.push(`${ev.violatedDirective}:${ev.blockedURI}`);
    });
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error' && /content security policy|csp/i.test(msg.text())) {
      consoleErrors.push(msg.text());
    }
  });

  return {
    async assertClean(): Promise<string[]> {
      const domViolations = await page.evaluate(() => {
        const win = window as unknown as { __cspViolations?: string[] };
        return win.__cspViolations ?? [];
      });
      return [...domViolations, ...consoleErrors];
    },
  };
}
