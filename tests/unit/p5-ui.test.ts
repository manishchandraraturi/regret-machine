import { describe, expect, it } from 'vitest';
import { claim, getScenesConfig } from '../../src/core/data';
import { translate } from '../../src/core/i18n';
import { createStore } from '../../src/core/store';
import { createStaffScreen } from '../../src/screens/staff';
import { createClaimChip } from '../../src/ui/components/claimchip';

describe('P5 ClaimChip and Staff screen', () => {
  it('renders ClaimChip with tag suffix and baseline sheet', () => {
    const c = claim('C-01');
    const chip = createClaimChip({
      claim: c,
      tagLabel: 'Intel-claimed, up to',
      closeLabel: 'Close',
    });
    expect(chip.textContent).toContain('Intel-claimed, up to');
    expect(chip.textContent).toContain(c.baseline);
  });

  it('renders not_configured on Staff when VITE_NEXT_STEP_URL is empty', () => {
    const store = createStore('en', true);
    store.setPersona('study');
    const root = document.createElement('div');
    const staff = createStaffScreen(() => {});
    staff.mount(root, {
      store,
      t: (k) => translate('en', k),
      claim,
      go: () => {},
    });
    expect(root.querySelector('[data-testid="staff-qr-not-configured"]')?.textContent).toContain(
      'not_configured',
    );
    expect(getScenesConfig().order).toHaveLength(4);
  });
});
