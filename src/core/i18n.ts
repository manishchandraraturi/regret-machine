import copyEn from '../data/copy.en.json';
import copyHi from '../data/copy.hi.json';
import type { Lang } from './types';

const enDict: Record<string, string> = copyEn;
const hiDict: Record<string, string> = copyHi;

export function parseLangParam(search: string): Lang {
  const params = new URLSearchParams(search);
  const raw = params.get('lang');
  return raw === 'hi' ? 'hi' : 'en';
}

export function translate(lang: Lang, key: string): string {
  const dict = lang === 'hi' ? hiDict : enDict;
  const val = dict[key];
  if (typeof val !== 'string' || val.length === 0) {
    return `CONTENT_MISSING:${key}`;
  }
  return val;
}

export function getCopyKeys(lang: Lang): string[] {
  return Object.keys(lang === 'hi' ? hiDict : enDict).sort();
}
