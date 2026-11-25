import claimsJson from '../data/claims.json';
import ladderJson from '../data/ladder.json';
import laptopsJson from '../data/laptops.json';
import personasJson from '../data/personas.json';
import scenesJson from '../data/scenes.json';
import type { Claim, LadderConfig, LaptopSpec, PersonaSpec, ScenesConfig } from './types';

function assertArray<T>(val: unknown, name: string): T[] {
  if (!Array.isArray(val) || val.length === 0) {
    throw new Error(`Invalid data file: ${name}`);
  }
  return val as T[];
}

function assertObject<T>(val: unknown, name: string): T {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    throw new Error(`Invalid data file: ${name}`);
  }
  return val as T;
}

const claimsList = assertArray<Claim>(claimsJson, 'claims.json');
const claimsMap = new Map<string, Claim>();
for (const c of claimsList) {
  if (!c.id || !c.text?.en || !c.text?.hi || !c.source_url || !c.tag) {
    throw new Error(`Malformed claim row: ${c.id ?? 'unknown'}`);
  }
  claimsMap.set(c.id, c);
}

const scenesConfig = assertObject<ScenesConfig>(scenesJson, 'scenes.json');
if (!Array.isArray(scenesConfig.order) || scenesConfig.order.length !== 4) {
  throw new Error('scenes.json must define 4 scenes in order');
}

const personasList = assertArray<PersonaSpec>(personasJson, 'personas.json');
const laptopsList = assertArray<LaptopSpec>(laptopsJson, 'laptops.json');
const ladderConfig = assertObject<LadderConfig>(ladderJson, 'ladder.json');

export function claim(id: string): Claim {
  const found = claimsMap.get(id);
  if (!found) {
    throw new Error(`Missing claim: ${id}`);
  }
  return found;
}

export function getClaims(): Claim[] {
  return claimsList;
}

export function getScenesConfig(): ScenesConfig {
  return scenesConfig;
}

export function getPersonas(): PersonaSpec[] {
  return personasList;
}

export function getLaptops(): LaptopSpec[] {
  return laptopsList;
}

export function getLadder(): LadderConfig {
  return ladderConfig;
}
