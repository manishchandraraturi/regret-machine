import { describe, expect, it } from 'vitest';
import { claim, getFairFight } from '../../src/core/data';

describe('P10 Fair Fight data', () => {
  it('every row has valid claim source ids and at least 2 rival concessions', () => {
    const rows = getFairFight();
    expect(rows.length).toBeGreaterThanOrEqual(5);

    let concessions = 0;
    for (const row of rows) {
      for (const col of ['intel', 'amd', 'qc'] as const) {
        const cell = row.cells[col];
        expect(claim(cell.claim).id).toBe(cell.claim);
        if (col !== 'intel' && cell.concession) {
          concessions += 1;
        }
      }
    }
    expect(concessions).toBeGreaterThanOrEqual(2);
  });
});
