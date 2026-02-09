import { WEEKS_PER_YEAR, MONTHS_PER_YEAR } from './constants';

export interface LifeConfig {
  birthDate: string;
  name: string;
  lifeExpectancy: number;
  retirementAge: number;
}

export interface RelationshipConfig {
  parentsAge: number;
  parentsLifeExpectancy: number;
  parentVisitsPerYear: number;
  phoneHoursPerDay: number;
  parentsAlive: 'both' | 'one' | 'neither';
  parentsLiveTogether: 'true' | 'false';
}

export interface TimeAllocation {
  sleep: number;
  work: number;
  family: number;
  partner: number;
  hobbies: number;
  health: number;
  chores: number;
}

export type WeekStatus = 'lived' | 'current' | 'future';
export type LifePhase = 'childhood' | 'education' | 'career' | 'retirement';

export interface WeekData {
  index: number;
  year: number;
  weekOfYear: number;
  status: WeekStatus;
  startDate: Date;
  phase: LifePhase;
}

export interface MonthData {
  index: number;
  year: number;
  monthOfYear: number;
  status: WeekStatus;
  phase: LifePhase;
}

export interface YearData {
  index: number;
  status: WeekStatus;
  phase: LifePhase;
  percentLived: number;
}

export interface LifeStats {
  totalWeeks: number;
  weeksLived: number;
  weeksRemaining: number;
  percentLived: number;
  currentWeekIndex: number;
  categoryBreakdown: Record<string, number>;
  summersLeft: number;
  weekendsLeft: number;
  // Relationship stats
  parentVisitsLeft: number;
  parentYearsLeft: number;
  phoneWeeksTotal: number;
  phoneYearsTotal: number;
  // Emotional stats
  booksLeft: number; // ~12 books/year average
  christmasesLeft: number;
  fullMoonsLeft: number;
}

export function calcWeeksLived(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function calcMonthsLived(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function calcTotalWeeks(lifeExpectancy: number): number {
  return lifeExpectancy * WEEKS_PER_YEAR;
}

export function getAgeFromWeekIndex(weekIndex: number): number {
  return Math.floor(weekIndex / WEEKS_PER_YEAR);
}

export function getPhaseForAge(age: number, retirementAge: number): LifePhase {
  if (age <= 5) return 'childhood';
  if (age <= 22) return 'education';
  if (age <= retirementAge) return 'career';
  return 'retirement';
}

export function calcCategoryBreakdown(
  timeAllocation: TimeAllocation,
  weeksRemaining: number,
  weeksUntilRetirement: number
): Record<string, number> {
  const breakdown: Record<string, number> = {};
  const effectiveRemaining = Math.max(0, weeksRemaining);
  const effectiveRetirement = Math.max(0, Math.min(weeksUntilRetirement, effectiveRemaining));

  for (const [key, hoursPerDay] of Object.entries(timeAllocation)) {
    if (key === 'work') {
      breakdown[key] = Math.round((hoursPerDay / 24) * effectiveRetirement);
    } else {
      breakdown[key] = Math.round((hoursPerDay / 24) * effectiveRemaining);
    }
  }

  const allocated = Object.values(breakdown).reduce((a, b) => a + b, 0);
  breakdown.free = Math.max(0, effectiveRemaining - allocated);

  return breakdown;
}

export function calcLifeStats(
  config: LifeConfig,
  allocation: TimeAllocation,
  relationships: RelationshipConfig
): LifeStats | null {
  if (!config.birthDate) return null;

  const totalWeeks = calcTotalWeeks(config.lifeExpectancy);
  const weeksLived = calcWeeksLived(config.birthDate);
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentLived = Math.min(100, (weeksLived / totalWeeks) * 100);
  const currentWeekIndex = weeksLived;

  const currentAge = weeksLived / WEEKS_PER_YEAR;
  const weeksUntilRetirement = Math.max(
    0,
    (config.retirementAge - currentAge) * WEEKS_PER_YEAR
  );

  const categoryBreakdown = calcCategoryBreakdown(
    allocation,
    weeksRemaining,
    weeksUntilRetirement
  );

  const yearsRemaining = weeksRemaining / WEEKS_PER_YEAR;
  const summersLeft = Math.floor(yearsRemaining);
  const weekendsLeft = weeksRemaining * 2;

  // Relationship stats
  let parentYearsLeft = 0;
  let parentVisitsLeft = 0;
  if (relationships.parentsAlive !== 'neither') {
    parentYearsLeft = Math.max(0, relationships.parentsLifeExpectancy - relationships.parentsAge);
    parentVisitsLeft = Math.round(parentYearsLeft * relationships.parentVisitsPerYear);
    if (relationships.parentsAlive === 'both' && relationships.parentsLiveTogether === 'false') {
      parentVisitsLeft *= 2;
    }
  }

  // Phone time: total weeks of your remaining life spent on phone
  const phoneWeeksTotal = Math.round((relationships.phoneHoursPerDay / 24) * weeksRemaining);
  const phoneYearsTotal = parseFloat((phoneWeeksTotal / WEEKS_PER_YEAR).toFixed(1));

  // Emotional stats
  const booksLeft = Math.round(yearsRemaining * 12);
  const christmasesLeft = Math.floor(yearsRemaining);
  const fullMoonsLeft = Math.round(yearsRemaining * 12.37);

  return {
    totalWeeks,
    weeksLived,
    weeksRemaining,
    percentLived,
    currentWeekIndex,
    categoryBreakdown,
    summersLeft,
    weekendsLeft,
    parentVisitsLeft,
    parentYearsLeft,
    phoneWeeksTotal,
    phoneYearsTotal,
    booksLeft,
    christmasesLeft,
    fullMoonsLeft,
  };
}

export function generateWeekData(config: LifeConfig): WeekData[] {
  if (!config.birthDate) return [];

  const totalWeeks = calcTotalWeeks(config.lifeExpectancy);
  const weeksLived = calcWeeksLived(config.birthDate);
  const birthDate = new Date(config.birthDate);
  const weeks: WeekData[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const startDate = new Date(birthDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const year = Math.floor(i / WEEKS_PER_YEAR);
    const weekOfYear = i % WEEKS_PER_YEAR;
    const age = getAgeFromWeekIndex(i);

    let status: WeekStatus;
    if (i < weeksLived) status = 'lived';
    else if (i === weeksLived) status = 'current';
    else status = 'future';

    weeks.push({
      index: i,
      year,
      weekOfYear,
      status,
      startDate,
      phase: getPhaseForAge(age, config.retirementAge),
    });
  }

  return weeks;
}

export function generateMonthData(config: LifeConfig): MonthData[] {
  if (!config.birthDate) return [];

  const totalMonths = config.lifeExpectancy * MONTHS_PER_YEAR;
  const monthsLived = calcMonthsLived(config.birthDate);
  const months: MonthData[] = [];

  for (let i = 0; i < totalMonths; i++) {
    const year = Math.floor(i / MONTHS_PER_YEAR);
    const monthOfYear = i % MONTHS_PER_YEAR;
    const age = year;

    let status: WeekStatus;
    if (i < monthsLived) status = 'lived';
    else if (i === monthsLived) status = 'current';
    else status = 'future';

    months.push({
      index: i,
      year,
      monthOfYear,
      status,
      phase: getPhaseForAge(age, config.retirementAge),
    });
  }

  return months;
}

export function generateYearData(config: LifeConfig): YearData[] {
  if (!config.birthDate) return [];

  const birth = new Date(config.birthDate);
  const now = new Date();
  const currentAge = (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const years: YearData[] = [];

  for (let i = 0; i < config.lifeExpectancy; i++) {
    let status: WeekStatus;
    let percentLived = 0;

    if (i < Math.floor(currentAge)) {
      status = 'lived';
      percentLived = 100;
    } else if (i === Math.floor(currentAge)) {
      status = 'current';
      percentLived = (currentAge - Math.floor(currentAge)) * 100;
    } else {
      status = 'future';
      percentLived = 0;
    }

    years.push({
      index: i,
      status,
      phase: getPhaseForAge(i, config.retirementAge),
      percentLived,
    });
  }

  return years;
}
