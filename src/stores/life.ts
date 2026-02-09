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
  DEFAULT_PARENTS_AGE,
  DEFAULT_PARENTS_LIFE_EXPECTANCY,
  DEFAULT_PARENT_VISITS_PER_YEAR,
  DEFAULT_PHONE_HOURS_PER_DAY,
  DEFAULT_PARENTS_ALIVE,
  DEFAULT_PARENTS_LIVE_TOGETHER,
} from '../lib/constants';

// ---- localStorage helpers (replaces @nanostores/persistent entirely) ----

const isBrowser = typeof window !== 'undefined';

function localAtom(key: string, fallback: string) {
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
  parentsAge: String(DEFAULT_PARENTS_AGE),
  parentsLifeExpectancy: String(DEFAULT_PARENTS_LIFE_EXPECTANCY),
  parentVisitsPerYear: String(DEFAULT_PARENT_VISITS_PER_YEAR),
  phoneHoursPerDay: String(DEFAULT_PHONE_HOURS_PER_DAY),
  parentsAlive: DEFAULT_PARENTS_ALIVE,
  parentsLiveTogether: DEFAULT_PARENTS_LIVE_TOGETHER,
});

export const $hasOnboarded = localAtom('onboarded', 'false');
export const $hasSeenReveal = localAtom('hasSeenReveal', 'false');
export const $theme = localAtom('theme', 'light');
export const $viewMode = localAtom('view-mode', 'weeks');

// UI-only ephemeral state (not persisted)
export const $highlightedCategory = atom<string | null>(null);

// ---- Derived stats ----

export const $lifeStats = computed(
  [$lifeConfig, $timeAllocation, $relationships],
  (config, allocation, relationships): LifeStats | null => {
    const parsedConfig: LifeConfig = {
      birthDate: config.birthDate || '',
      name: config.name || '',
      lifeExpectancy: Number(config.lifeExpectancy) || DEFAULT_LIFE_EXPECTANCY,
      retirementAge: Number(config.retirementAge) || DEFAULT_RETIREMENT_AGE,
    };
    const parsedAllocation: TimeAllocation = {
      sleep: Number(allocation.sleep) || DEFAULT_TIME_ALLOCATION.sleep,
      work: Number(allocation.work) || DEFAULT_TIME_ALLOCATION.work,
      family: Number(allocation.family) || DEFAULT_TIME_ALLOCATION.family,
      partner: Number(allocation.partner) || DEFAULT_TIME_ALLOCATION.partner,
      hobbies: Number(allocation.hobbies) || DEFAULT_TIME_ALLOCATION.hobbies,
      health: Number(allocation.health) || DEFAULT_TIME_ALLOCATION.health,
      chores: Number(allocation.chores) || DEFAULT_TIME_ALLOCATION.chores,
    };
    const parsedRelationships: RelationshipConfig = {
      parentsAge: Number(relationships.parentsAge) || DEFAULT_PARENTS_AGE,
      parentsLifeExpectancy: Number(relationships.parentsLifeExpectancy) || DEFAULT_PARENTS_LIFE_EXPECTANCY,
      parentVisitsPerYear: Number(relationships.parentVisitsPerYear) || DEFAULT_PARENT_VISITS_PER_YEAR,
      phoneHoursPerDay: Number(relationships.phoneHoursPerDay) || DEFAULT_PHONE_HOURS_PER_DAY,
      parentsAlive: (relationships.parentsAlive as 'both' | 'one' | 'neither') || DEFAULT_PARENTS_ALIVE as 'both',
      parentsLiveTogether: (relationships.parentsLiveTogether as 'true' | 'false') || DEFAULT_PARENTS_LIVE_TOGETHER as 'true',
    };
    return calcLifeStats(parsedConfig, parsedAllocation, parsedRelationships);
  }
);
