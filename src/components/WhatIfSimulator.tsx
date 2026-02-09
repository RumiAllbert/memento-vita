import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import {
  $lifeConfig,
  $timeAllocation,
  $relationships,
  $lifeStats,
  $parsedCustomCategories,
} from '../stores/life';
import TimeSlider from './TimeSlider';
import {
  calcLifeStats,
  type LifeConfig,
  type TimeAllocation,
  type RelationshipConfig,
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
  WEEKS_PER_YEAR,
  getCategoryColor,
  getCategoryLabel,
  getCategoryEmoji,
} from '../lib/constants';
import ThemeToggle from './ThemeToggle';

function DeltaBadge({ current, alt, unit = 'wks' }: { current: number; alt: number; unit?: string }) {
  const diff = alt - current;
  if (Math.abs(diff) < 1) return null;
  const positive = diff > 0;
  return (
    <span
      className="text-[10px] font-medium tabular-nums ml-2"
      style={{ color: positive ? '#6b8f71' : '#e06c75' }}
    >
      {positive ? '+' : ''}{Math.round(diff).toLocaleString()} {unit}
    </span>
  );
}

export default function WhatIfSimulator() {
  const currentStats = useStore($lifeStats);
  const rawConfig = useStore($lifeConfig);
  const rawAlloc = useStore($timeAllocation);
  const rawRels = useStore($relationships);
  const customCats = useStore($parsedCustomCategories);

  // Parse current values
  const config: LifeConfig = {
    birthDate: rawConfig.birthDate || '',
    name: rawConfig.name || '',
    lifeExpectancy: Number(rawConfig.lifeExpectancy) || DEFAULT_LIFE_EXPECTANCY,
    retirementAge: Number(rawConfig.retirementAge) || DEFAULT_RETIREMENT_AGE,
  };

  const baseAlloc: TimeAllocation = {
    sleep: Number(rawAlloc.sleep) || DEFAULT_TIME_ALLOCATION.sleep,
    work: Number(rawAlloc.work) || DEFAULT_TIME_ALLOCATION.work,
    family: Number(rawAlloc.family) || DEFAULT_TIME_ALLOCATION.family,
    partner: Number(rawAlloc.partner) || DEFAULT_TIME_ALLOCATION.partner,
    hobbies: Number(rawAlloc.hobbies) || DEFAULT_TIME_ALLOCATION.hobbies,
    health: Number(rawAlloc.health) || DEFAULT_TIME_ALLOCATION.health,
    chores: Number(rawAlloc.chores) || DEFAULT_TIME_ALLOCATION.chores,
  };
  // Include custom categories in base allocation
  for (const cat of customCats) {
    baseAlloc[cat.id] = cat.hours;
  }

  const motherAlive = (rawRels.motherAlive || DEFAULT_MOTHER_ALIVE) as 'true' | 'false';
  const fatherAlive = (rawRels.fatherAlive || DEFAULT_FATHER_ALIVE) as 'true' | 'false';
  const anyParentAlive = motherAlive === 'true' || fatherAlive === 'true';

  const baseRels: RelationshipConfig = {
    motherAge: Number(rawRels.motherAge) || DEFAULT_MOTHER_AGE,
    fatherAge: Number(rawRels.fatherAge) || DEFAULT_FATHER_AGE,
    motherLifeExpectancy: Number(rawRels.motherLifeExpectancy) || DEFAULT_MOTHER_LIFE_EXPECTANCY,
    fatherLifeExpectancy: Number(rawRels.fatherLifeExpectancy) || DEFAULT_FATHER_LIFE_EXPECTANCY,
    motherVisitsPerYear: Number(rawRels.motherVisitsPerYear) || DEFAULT_MOTHER_VISITS_PER_YEAR,
    fatherVisitsPerYear: Number(rawRels.fatherVisitsPerYear) || DEFAULT_FATHER_VISITS_PER_YEAR,
    motherAlive,
    fatherAlive,
    phoneHoursPerDay: Number(rawRels.phoneHoursPerDay) || DEFAULT_PHONE_HOURS_PER_DAY,
  };

  // "What if" adjustable state
  const [altAlloc, setAltAlloc] = useState<TimeAllocation>({ ...baseAlloc });
  const [altRels, setAltRels] = useState<RelationshipConfig>({ ...baseRels });
  const [altRetirement, setAltRetirement] = useState(config.retirementAge);

  const altConfig: LifeConfig = { ...config, retirementAge: altRetirement };
  const altStats = useMemo(
    () => calcLifeStats(altConfig, altAlloc, altRels),
    [altConfig, altAlloc, altRels]
  );

  if (!currentStats || !altStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--th-text-muted)' }}>
          Complete onboarding first to use the simulator.
        </p>
      </div>
    );
  }

  const resetAll = () => {
    setAltAlloc({ ...baseAlloc });
    setAltRels({ ...baseRels });
    setAltRetirement(config.retirementAge);
  };

  const categories = Object.entries(altStats.categoryBreakdown);

  // Separate built-in and custom allocation keys for sliders
  const builtinKeys = ['sleep', 'work', 'family', 'partner', 'hobbies', 'health', 'chores'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-10">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-lg sm:text-xl font-medium" style={{ color: 'var(--th-text)' }}>What If?</h1>
          <p className="text-[10px] sm:text-xs mt-1" style={{ color: 'var(--th-text-muted)' }}>
            Adjust the sliders to explore alternative futures
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href="/dashboard"
            className="text-xs px-3 sm:px-4 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--th-text-muted)', border: '1px solid var(--th-border)' }}
          >
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Sliders */}
        <motion.div
          className="rounded-2xl p-4 sm:p-6 space-y-6 sm:space-y-8"
          style={{ backgroundColor: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
              Adjust Your Future
            </h2>
            <button
              onClick={resetAll}
              className="text-[10px] px-3 py-1 rounded-md transition-colors"
              style={{ color: 'var(--th-text-muted)', border: '1px solid var(--th-border)' }}
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            <TimeSlider
              label="Retirement Age"
              value={altRetirement}
              min={30}
              max={80}
              step={1}
              unit="years old"
              onChange={setAltRetirement}
            />
            <DeltaBadge
              current={config.retirementAge}
              alt={altRetirement}
              unit="years"
            />
          </div>

          <div className="space-y-5">
            <h3 className="text-xs" style={{ color: 'var(--th-text-muted)' }}>Daily Time Allocation</h3>
            {builtinKeys.map((key) => (
              <div key={key} className="space-y-1">
                <TimeSlider
                  label={getCategoryLabel(key)}
                  value={altAlloc[key] || 0}
                  min={0}
                  max={16}
                  step={0.5}
                  color={getCategoryColor(key)}
                  onChange={(v) => setAltAlloc((prev) => ({ ...prev, [key]: v }))}
                />
                <DeltaBadge
                  current={currentStats.categoryBreakdown[key] || 0}
                  alt={altStats.categoryBreakdown[key] || 0}
                />
              </div>
            ))}

            {/* Custom category sliders */}
            {customCats.length > 0 && customCats.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <TimeSlider
                  label={`${cat.emoji} ${cat.label}`}
                  value={altAlloc[cat.id] || 0}
                  min={0}
                  max={16}
                  step={0.5}
                  color={cat.color}
                  onChange={(v) => setAltAlloc((prev) => ({ ...prev, [cat.id]: v }))}
                />
                <DeltaBadge
                  current={currentStats.categoryBreakdown[cat.id] || 0}
                  alt={altStats.categoryBreakdown[cat.id] || 0}
                />
              </div>
            ))}
          </div>

          <div className="space-y-5 pt-6" style={{ borderTop: '1px solid var(--th-border)' }}>
            <h3 className="text-xs" style={{ color: 'var(--th-text-muted)' }}>Relationships & Habits</h3>
            {motherAlive === 'true' && (
              <div className="space-y-1">
                <TimeSlider
                  label="See mother per year"
                  value={altRels.motherVisitsPerYear}
                  min={0}
                  max={52}
                  step={1}
                  unit="times/year"
                  color={getCategoryColor('parents')}
                  onChange={(v) => setAltRels((prev) => ({ ...prev, motherVisitsPerYear: v }))}
                />
                <DeltaBadge current={currentStats.motherVisitsLeft} alt={altStats.motherVisitsLeft} unit="visits" />
              </div>
            )}
            {fatherAlive === 'true' && (
              <div className="space-y-1">
                <TimeSlider
                  label="See father per year"
                  value={altRels.fatherVisitsPerYear}
                  min={0}
                  max={52}
                  step={1}
                  unit="times/year"
                  color={getCategoryColor('parents')}
                  onChange={(v) => setAltRels((prev) => ({ ...prev, fatherVisitsPerYear: v }))}
                />
                <DeltaBadge current={currentStats.fatherVisitsLeft} alt={altStats.fatherVisitsLeft} unit="visits" />
              </div>
            )}
            <div className="space-y-1">
              <TimeSlider
                label="Phone screen time"
                value={altRels.phoneHoursPerDay}
                min={0}
                max={12}
                step={0.5}
                unit="hrs/day"
                color={getCategoryColor('phone')}
                onChange={(v) => setAltRels((prev) => ({ ...prev, phoneHoursPerDay: v }))}
              />
              <DeltaBadge current={currentStats.phoneWeeksTotal} alt={altStats.phoneWeeksTotal} />
            </div>
          </div>
        </motion.div>

        {/* Right: Comparison */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Key delta stats */}
          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{ backgroundColor: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
          >
            <h2 className="text-sm font-medium mb-4 sm:mb-6" style={{ color: 'var(--th-text)' }}>
              Impact Summary
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Free time gained/lost',
                  current: currentStats.categoryBreakdown.free || 0,
                  alt: altStats.categoryBreakdown.free || 0,
                  unit: 'weeks',
                },
                ...(anyParentAlive
                  ? [{
                      label: 'Parent visits',
                      current: currentStats.parentVisitsLeft,
                      alt: altStats.parentVisitsLeft,
                      unit: 'visits',
                    }]
                  : []),
                {
                  label: 'Phone time',
                  current: currentStats.phoneWeeksTotal,
                  alt: altStats.phoneWeeksTotal,
                  unit: 'weeks',
                  invert: true,
                },
                {
                  label: 'Weekends',
                  current: currentStats.weekendsLeft,
                  alt: altStats.weekendsLeft,
                  unit: 'days',
                },
              ].map(({ label, current, alt, unit, invert }) => {
                const diff = alt - current;
                const isGood = invert ? diff < 0 : diff > 0;
                return (
                  <div key={label} className="space-y-1">
                    <div className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>{label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-medium tabular-nums" style={{ color: 'var(--th-text)' }}>
                        {alt.toLocaleString()}
                      </span>
                      {Math.abs(diff) >= 1 && (
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: isGood ? '#6b8f71' : '#e06c75' }}
                        >
                          {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString()} {unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-side bars */}
          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{ backgroundColor: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
          >
            <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--th-text)' }}>
              Current vs. What If
            </h2>
            <p className="text-[10px] mb-6" style={{ color: 'var(--th-text-muted)' }}>
              Weeks allocated per category
            </p>

            <div className="space-y-5">
              {categories.map(([key, altWeeks]) => {
                const currentWeeks = currentStats.categoryBreakdown[key] || 0;
                const maxWeeks = Math.max(currentWeeks, altWeeks, 1);
                const color = getCategoryColor(key);
                const emoji = getCategoryEmoji(key);
                const diff = altWeeks - currentWeeks;

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs" style={{ color: 'var(--th-text-muted)' }}>
                        {emoji} {getCategoryLabel(key)}
                      </span>
                      {Math.abs(diff) >= 1 && (
                        <span
                          className="text-[10px] font-medium tabular-nums"
                          style={{ color: diff > 0 ? '#6b8f71' : '#e06c75' }}
                        >
                          {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString()} wks
                        </span>
                      )}
                    </div>
                    {/* Current */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] w-10 text-right tabular-nums" style={{ color: 'var(--th-text-muted)' }}>
                        Now
                      </span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--th-future)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color, opacity: 0.5 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentWeeks / maxWeeks) * 100}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="text-[9px] w-14 tabular-nums" style={{ color: 'var(--th-text-muted)' }}>
                        {currentWeeks.toLocaleString()}
                      </span>
                    </div>
                    {/* Alt */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] w-10 text-right tabular-nums" style={{ color }}>
                        If
                      </span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--th-future)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(altWeeks / maxWeeks) * 100}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="text-[9px] w-14 tabular-nums font-medium" style={{ color }}>
                        {altWeeks.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emotional callout */}
          <motion.div
            className="rounded-2xl p-4 sm:p-6"
            style={{ backgroundColor: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
              {(() => {
                const freeDiff = (altStats.categoryBreakdown.free || 0) - (currentStats.categoryBreakdown.free || 0);
                const phoneDiff = altStats.phoneWeeksTotal - currentStats.phoneWeeksTotal;
                const visitDiff = altStats.parentVisitsLeft - currentStats.parentVisitsLeft;

                const lines: string[] = [];
                if (Math.abs(freeDiff) > 10) {
                  const yrs = (Math.abs(freeDiff) / WEEKS_PER_YEAR).toFixed(1);
                  lines.push(
                    freeDiff > 0
                      ? `You'd gain ~${yrs} years of free time.`
                      : `You'd lose ~${yrs} years of free time.`
                  );
                }
                if (phoneDiff < -20) {
                  const yrs = (Math.abs(phoneDiff) / WEEKS_PER_YEAR).toFixed(1);
                  lines.push(`Cutting phone time saves ~${yrs} years of your life.`);
                }
                if (visitDiff > 10 && anyParentAlive) {
                  lines.push(`You'd see your parents ${visitDiff} more times. They'd notice.`);
                }
                if (lines.length === 0) {
                  lines.push('Move the sliders to see how small changes reshape your remaining time.');
                }
                return lines.join(' ');
              })()}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
