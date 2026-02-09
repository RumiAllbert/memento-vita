import { atom, map, computed } from 'nanostores';
import {
  calcLifeStats,
  type LifeConfig,
  type TimeAllocation,
  type RelationshipConfig,
  type LifeStats,
} from '../lib/calculations';
import {
  DEFAULT_LIFE_EXPECTANCY,
  DEFAULT_RETIREMENT_AGE,
  DEFAULT_TIME_ALLOCATION,
  DEFAULT_MOTHER_AGE,
  DEFAULT_FATHER_AGE,
  DEFAULT_MOTHER_LIFE_EXPECTANCY,
  DEFAULT_FATHER_LIFE_EXPECTANCY,
  DEFAULT_MOTHER_VISITS_PER_YEAR,
  DEFAULT_FATHER_VISITS_PER_YEAR,
  DEFAULT_MOTHER_ALIVE,
  DEFAULT_FATHER_ALIVE,
  DEFAULT_PHONE_HOURS_PER_DAY,
  setCustomCategoriesRef,
  type CustomCategory,
} from '../lib/constants';

// ---- localStorage helpers (replaces @nanostores/persistent entirely) ----

const isBrowser = typeof window !== 'undefined';

export function localAtom(key: string, fallback: string) {
  const stored = isBrowser ? localStorage.getItem(key) : null;
  const store = atom<string>(stored ?? fallback);
  store.listen((val) => {
    if (isBrowser) localStorage.setItem(key, val);
  });
  return store;
}

function localMap<T extends Record<string, string>>(prefix: string, defaults: T) {
  // Hydrate from localStorage
  const initial: Record<string, string> = {};
  for (const k of Object.keys(defaults)) {
    const stored = isBrowser ? localStorage.getItem(prefix + k) : null;
    initial[k] = stored ?? defaults[k];
  }
  const store = map<T>(initial as T);

  // Persist every change back to localStorage
  store.subscribe((val) => {
    if (!isBrowser) return;
    for (const k of Object.keys(defaults)) {
      localStorage.setItem(prefix + k, val[k]);
    }
  });

  return store;
}

// ---- Migration: old parent fields → new split mother/father fields ----

function migrateRelationships() {
  if (!isBrowser) return;

  // Check if new keys already exist — skip migration if so
  if (localStorage.getItem('relationships:motherAge') !== null) return;

  // Check if old keys exist
  const oldAge = localStorage.getItem('relationships:parentsAge');
  if (oldAge === null) return; // fresh install, no migration needed

  const oldLE = localStorage.getItem('relationships:parentsLifeExpectancy');
  const oldVisits = localStorage.getItem('relationships:parentVisitsPerYear');
  const oldAlive = localStorage.getItem('relationships:parentsAlive');

  // Copy old values to both mother and father
  if (oldAge) {
    localStorage.setItem('relationships:motherAge', oldAge);
    localStorage.setItem('relationships:fatherAge', oldAge);
  }
  if (oldLE) {
    localStorage.setItem('relationships:motherLifeExpectancy', oldLE);
    localStorage.setItem('relationships:fatherLifeExpectancy', oldLE);
  }
  if (oldVisits) {
    localStorage.setItem('relationships:motherVisitsPerYear', oldVisits);
    localStorage.setItem('relationships:fatherVisitsPerYear', oldVisits);
  }

  // Map parentsAlive: 'both' → both true, 'one' → mother true / father false, 'neither' → both false
  if (oldAlive === 'both') {
    localStorage.setItem('relationships:motherAlive', 'true');
    localStorage.setItem('relationships:fatherAlive', 'true');
  } else if (oldAlive === 'one') {
    localStorage.setItem('relationships:motherAlive', 'true');
    localStorage.setItem('relationships:fatherAlive', 'false');
  } else if (oldAlive === 'neither') {
    localStorage.setItem('relationships:motherAlive', 'false');
    localStorage.setItem('relationships:fatherAlive', 'false');
  }
}

// Run migration before store initialization
migrateRelationships();

// ---- Stores ----

export const $lifeConfig = localMap<Record<string, string>>('life-config:', {
  birthDate: '',
  name: '',
  lifeExpectancy: String(DEFAULT_LIFE_EXPECTANCY),
  retirementAge: String(DEFAULT_RETIREMENT_AGE),
});

export const $timeAllocation = localMap<Record<string, string>>('time-alloc:', {
  sleep: String(DEFAULT_TIME_ALLOCATION.sleep),
  work: String(DEFAULT_TIME_ALLOCATION.work),
  family: String(DEFAULT_TIME_ALLOCATION.family),
  partner: String(DEFAULT_TIME_ALLOCATION.partner),
  hobbies: String(DEFAULT_TIME_ALLOCATION.hobbies),
  health: String(DEFAULT_TIME_ALLOCATION.health),
  chores: String(DEFAULT_TIME_ALLOCATION.chores),
});

export const $relationships = localMap<Record<string, string>>('relationships:', {
  motherAge: String(DEFAULT_MOTHER_AGE),
  fatherAge: String(DEFAULT_FATHER_AGE),
  motherLifeExpectancy: String(DEFAULT_MOTHER_LIFE_EXPECTANCY),
  fatherLifeExpectancy: String(DEFAULT_FATHER_LIFE_EXPECTANCY),
  motherVisitsPerYear: String(DEFAULT_MOTHER_VISITS_PER_YEAR),
  fatherVisitsPerYear: String(DEFAULT_FATHER_VISITS_PER_YEAR),
  motherAlive: DEFAULT_MOTHER_ALIVE,
  fatherAlive: DEFAULT_FATHER_ALIVE,
  phoneHoursPerDay: String(DEFAULT_PHONE_HOURS_PER_DAY),
});

export const $hasOnboarded = localAtom('onboarded', 'false');
export const $hasSeenReveal = localAtom('hasSeenReveal', 'false');
export const $theme = localAtom('theme', 'light');
export const $viewMode = localAtom('view-mode', 'weeks');

// Custom categories (stored as JSON string)
export const $customCategories = localAtom('custom-categories', '[]');

// UI-only ephemeral state (not persisted)
export const $highlightedCategory = atom<string | null>(null);

// ---- Parsed intermediate stores (single source of truth for string→number) ----

export const $parsedConfig = computed([$lifeConfig], (config): LifeConfig => ({
  birthDate: config.birthDate || '',
  name: config.name || '',
  lifeExpectancy: Number(config.lifeExpectancy) || DEFAULT_LIFE_EXPECTANCY,
  retirementAge: Number(config.retirementAge) || DEFAULT_RETIREMENT_AGE,
}));

export const $parsedCustomCategories = computed([$customCategories], (raw): CustomCategory[] => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Keep the global ref in sync for helper functions
      setCustomCategoriesRef(parsed);
      return parsed;
    }
  } catch {}
  setCustomCategoriesRef([]);
  return [];
});

export const $parsedAllocation = computed(
  [$timeAllocation, $parsedCustomCategories],
  (allocation, customCats): TimeAllocation => {
    const base: TimeAllocation = {
      sleep: Number(allocation.sleep) || DEFAULT_TIME_ALLOCATION.sleep,
      work: Number(allocation.work) || DEFAULT_TIME_ALLOCATION.work,
      family: Number(allocation.family) || DEFAULT_TIME_ALLOCATION.family,
      partner: Number(allocation.partner) || DEFAULT_TIME_ALLOCATION.partner,
      hobbies: Number(allocation.hobbies) || DEFAULT_TIME_ALLOCATION.hobbies,
      health: Number(allocation.health) || DEFAULT_TIME_ALLOCATION.health,
      chores: Number(allocation.chores) || DEFAULT_TIME_ALLOCATION.chores,
    };
    for (const cat of customCats) {
      base[cat.id] = cat.hours;
    }
    return base;
  }
);

export const $parsedRelationships = computed([$relationships], (relationships): RelationshipConfig => ({
  motherAge: Number(relationships.motherAge) || DEFAULT_MOTHER_AGE,
  fatherAge: Number(relationships.fatherAge) || DEFAULT_FATHER_AGE,
  motherLifeExpectancy: Number(relationships.motherLifeExpectancy) || DEFAULT_MOTHER_LIFE_EXPECTANCY,
  fatherLifeExpectancy: Number(relationships.fatherLifeExpectancy) || DEFAULT_FATHER_LIFE_EXPECTANCY,
  motherVisitsPerYear: Number(relationships.motherVisitsPerYear) || DEFAULT_MOTHER_VISITS_PER_YEAR,
  fatherVisitsPerYear: Number(relationships.fatherVisitsPerYear) || DEFAULT_FATHER_VISITS_PER_YEAR,
  motherAlive: (relationships.motherAlive as 'true' | 'false') || DEFAULT_MOTHER_ALIVE as 'true',
  fatherAlive: (relationships.fatherAlive as 'true' | 'false') || DEFAULT_FATHER_ALIVE as 'true',
  phoneHoursPerDay: Number(relationships.phoneHoursPerDay) || DEFAULT_PHONE_HOURS_PER_DAY,
}));

// ---- Derived stats ----

export const $lifeStats = computed(
  [$parsedConfig, $parsedAllocation, $parsedRelationships],
  (config, allocation, relationships): LifeStats | null => {
    return calcLifeStats(config, allocation, relationships);
  }
);
