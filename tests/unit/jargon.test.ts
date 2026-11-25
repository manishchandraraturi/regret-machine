import { describe, expect, it } from 'vitest';
import copyEn from '../../src/data/copy.en.json';

const JARGON_TERMS = [
  /\bNPU\b/,
  /\bTOPS\b/,
  /\bGPU\b/,
  /\bx86\b/,
  /\bArm\b/,
  /\bLLM\b/,
  /\bbenchmark\b/i,
  /\binference\b/i,
  /\bXe\b/,
  /\bXMX\b/,
];

describe('P11 copy jargon lint (SRC-04)', () => {
  it('verifies shopper-facing copy.en.json has no unglossed jargon and glossary keys exist', () => {
    const dict = copyEn as Record<string, string>;
    expect(dict['glossary.npu']).toContain('NPU:');
    expect(dict['glossary.tops']).toContain('TOPS:');
    expect(dict['glossary.gpu']).toContain('Graphics:');

    const unglossed: string[] = [];
    for (const [key, text] of Object.entries(dict)) {
      if (key.startsWith('glossary.')) continue;
      for (const re of JARGON_TERMS) {
        if (re.test(text)) {
          unglossed.push(`${key}: ${text}`);
        }
      }
    }
    expect(unglossed).toEqual([]);
  });
});
