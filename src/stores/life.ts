import { persistentMap, persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
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
} from '../lib/constants';
import type { ViewMode } from '../lib/constants';

type StringMap<T> = { [K in keyof T]: string };

export const $lifeConfig = persistentMap<StringMap<LifeConfig>>('life-config:', {
  birthDate: '',
  name: '',
  lifeExpectancy: String(DEFAULT_LIFE_EXPECTANCY),
  retirementAge: String(DEFAULT_RETIREMENT_AGE),
});

export const $timeAllocation = persistentMap<StringMap<TimeAllocation>>('time-alloc:', {
  sleep: String(DEFAULT_TIME_ALLOCATION.sleep),
  work: String(DEFAULT_TIME_ALLOCATION.work),
  family: String(DEFAULT_TIME_ALLOCATION.family),
  partner: String(DEFAULT_TIME_ALLOCATION.partner),
  hobbies: String(DEFAULT_TIME_ALLOCATION.hobbies),
  health: String(DEFAULT_TIME_ALLOCATION.health),
  chores: String(DEFAULT_TIME_ALLOCATION.chores),
});

export const $relationships = persistentMap<StringMap<RelationshipConfig>>('relationships:', {
  parentsAge: String(DEFAULT_PARENTS_AGE),
  parentsLifeExpectancy: String(DEFAULT_PARENTS_LIFE_EXPECTANCY),
  parentVisitsPerYear: String(DEFAULT_PARENT_VISITS_PER_YEAR),
  phoneHoursPerDay: String(DEFAULT_PHONE_HOURS_PER_DAY),
});

export const $hasOnboarded = persistentAtom<string>('onboarded', 'false');
export const $theme = persistentAtom<string>('theme', 'dark');
export const $viewMode = persistentAtom<string>('view-mode', 'weeks');

export const $lifeStats = computed(
  [$lifeConfig, $timeAllocation, $relationships],
  (config, allocation, relationships): LifeStats | null => {
    const parsedConfig: LifeConfig = {
      birthDate: config.birthDate,
      name: config.name,
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
    };
    return calcLifeStats(parsedConfig, parsedAllocation, parsedRelationships);
  }
);
