import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { attachCspGuard } from './csp';

const PERSONAS = [
  { id: 'study', label: 'Study', card: 'The Topper' },
  { id: 'create', label: 'Create', card: 'The Reel Machine' },
  { id: 'game', label: 'Game', card: 'The Frame Chaser' },
  { id: 'hustle', label: 'Work and side hustle', card: 'The Always-On Operator' },
] as const;

async function runToReceipt(page: Page, personaLabel: string): Promise<void> {
  await page.getByRole('button', { name: 'Pick your laptop' }).click();
  await page.getByRole('button', { name: /Zesta Glow/ }).click();
  await page.getByRole('button', { name: personaLabel, exact: true }).click();
  await page.getByRole('button', { name: 'Buy it' }).click();

  // flip1 -> lecture -> flip2 -> battery -> creator -> flip3 -> private -> receipt
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
  await page.clock.runFor(16_500);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-screen="battery"]')).toBeVisible();
  await page.clock.runFor(16_500);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-screen="creator"]')).toBeVisible();
  await page.clock.runFor(16_500);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-screen="private"]')).toBeVisible();
  await page.clock.runFor(16_500);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-screen="receipt"]')).toBeVisible();
}

test.describe('P5 CUT LINE 1 end-to-end', () => {
  test('all 4 personas reach 4 different Result cards, download 1080x1920 PNG, Staff & Play again', async ({
    page,
  }) => {
    const thirdParty: string[] = [];
    const csp = await attachCspGuard(page);
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.origin !== 'http://127.0.0.1:4173') thirdParty.push(req.url());
    });

    await page.clock.install();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const seenCards: string[] = [];
    for (const p of PERSONAS) {
      await runToReceipt(page, p.label);
      if (p.id === 'study') {
        await page.screenshot({ path: 'evidence/P5/receipt-1920x1080.png' });
      }
      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.locator('[data-screen="result"]')).toBeVisible();
      await expect(page.getByRole('heading', { name: p.card })).toBeVisible();
      seenCards.push(p.card);
      await page.screenshot({ path: `evidence/P5/result-${p.id}-1920x1080.png` });

      if (p.id === 'study') {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          page.getByRole('button', { name: 'Save my card' }).click(),
        ]);
        const stream = await download.createReadStream();
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk as Uint8Array);
        }
        const totalLen = chunks.reduce((acc, c) => acc + c.byteLength, 0);
        const bytes = new Uint8Array(totalLen);
        let offset = 0;
        for (const c of chunks) {
          bytes.set(c, offset);
          offset += c.byteLength;
        }
        const view = new DataView(bytes.buffer);
        expect(view.getUint32(16, false)).toBe(1080);
        expect(view.getUint32(20, false)).toBe(1920);

        // Language switch on Result keeps state
        await page.getByRole('button', { name: 'हिन्दी' }).click();
        await expect(page.locator('[data-screen="result"]')).toContainText('टॉपर');
        await page.screenshot({ path: 'evidence/P5/result-hi-1920x1080.png' });
        await page.getByRole('button', { name: 'English' }).click();

        await page.getByRole('button', { name: 'Show the store team' }).click();
        await expect(page.locator('[data-screen="staff"]')).toBeVisible();
        await page.screenshot({ path: 'evidence/P5/staff-1920x1080.png' });
      }

      await page.getByRole('button', { name: 'Play again' }).click();
      await expect(page.locator('[data-screen="attract"]')).toBeVisible();
    }

    expect(new Set(seenCards).size).toBe(4);
    expect(thirdParty).toEqual([]);
    expect(await csp.assertClean()).toEqual([]);
  });

  test('mobile 390x844 screenshots, reduced-motion, and axe-core accessibility', async ({
    page,
  }) => {
    const csp = await attachCspGuard(page);
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const assertNoSeriousAxe = async (screenName: string): Promise<void> => {
      const results = await new AxeBuilder({ page }).analyze();
      console.log(
        `AXE_RAW[${screenName}]=` +
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.length,
              help: v.help,
            })),
          ),
      );
      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(serious, `axe violations on ${screenName}`).toEqual([]);
    };

    await assertNoSeriousAxe('attract');
    await page.getByRole('button', { name: 'Pick your laptop' }).click();
    await assertNoSeriousAxe('shelf');

    await page.getByRole('button', { name: /Zesta Glow/ }).click();
    await page.getByRole('button', { name: 'Study', exact: true }).click();
    await page.getByRole('button', { name: 'Buy it' }).click();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-screen="lecture"]')).toBeVisible();
    await page.clock.runFor(16_500);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-screen="battery"]')).toBeVisible();
    await page.clock.runFor(16_500);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-screen="creator"]')).toBeVisible();
    await page.clock.runFor(16_500);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('[data-screen="private"]')).toBeVisible();
    await page.clock.runFor(16_500);
    await page.getByRole('button', { name: 'Next' }).click();

    await assertNoSeriousAxe('receipt');
    await page.screenshot({ path: 'evidence/P5/receipt-390x844.png' });

    await page.getByRole('button', { name: 'See the fair fight' }).click();
    await expect(page.locator('[data-screen="fairfight"]')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await assertNoSeriousAxe('result');
    await page.screenshot({ path: 'evidence/P5/result-study-390x844.png' });

    await page.getByRole('button', { name: 'हिन्दी' }).click();
    await expect(page.locator('[data-screen="result"]')).toContainText('टॉपर');
    await page.screenshot({ path: 'evidence/P5/result-hi-390x844.png' });
    await page.getByRole('button', { name: 'English' }).click();

    await page.getByRole('button', { name: 'Show the store team' }).click();
    await assertNoSeriousAxe('staff');
    await page.screenshot({ path: 'evidence/P5/staff-390x844.png' });

    for (const p of PERSONAS.slice(1)) {
      await page.getByRole('button', { name: 'Play again' }).click();
      await runToReceipt(page, p.label);
      await page.getByRole('button', { name: 'See the fair fight' }).click();
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByRole('heading', { name: p.card })).toBeVisible();
      await page.screenshot({ path: `evidence/P5/result-${p.id}-390x844.png` });
    }

    expect(await csp.assertClean()).toEqual([]);
  });
});
