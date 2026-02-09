import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeConfig } from '../stores/life';
import { generateWeekData } from '../lib/calculations';
import { WEEKS_PER_YEAR, PHASE_COLORS, DEFAULT_LIFE_EXPECTANCY, DEFAULT_RETIREMENT_AGE } from '../lib/constants';
import LifeGridCell from './LifeGridCell';
import type { LifeConfig } from '../lib/calculations';

export default function LifeGrid() {
  const rawConfig = useStore($lifeConfig);

  const config: LifeConfig = useMemo(() => ({
    birthDate: rawConfig.birthDate,
    lifeExpectancy: Number(rawConfig.lifeExpectancy) || DEFAULT_LIFE_EXPECTANCY,
    retirementAge: Number(rawConfig.retirementAge) || DEFAULT_RETIREMENT_AGE,
  }), [rawConfig.birthDate, rawConfig.lifeExpectancy, rawConfig.retirementAge]);

  const weeks = useMemo(() => generateWeekData(config), [config]);

  if (!weeks.length) return null;

  const totalYears = config.lifeExpectancy;
  const rows = Array.from({ length: totalYears }, (_, year) => {
    const startIdx = year * WEEKS_PER_YEAR;
    return weeks.slice(startIdx, startIdx + WEEKS_PER_YEAR);
  });

  return (
    <motion.div
      className="bg-surface rounded-xl p-6 border border-future-border overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="flex gap-1 min-w-0">
        {/* Age labels */}
        <div className="flex flex-col shrink-0" style={{ gap: '1px' }}>
          {rows.map((_, year) => (
            <div
              key={year}
              className="flex items-center justify-end pr-2"
              style={{
                height: '7px',
                width: '28px',
              }}
            >
              {year % 5 === 0 && (
                <span className="text-[7px] text-text-muted leading-none tabular-nums">
                  {year}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          className="grid flex-1 min-w-0"
          style={{
            gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, 1fr)`,
            gap: '1px',
          }}
        >
          {rows.map((row, year) => {
            const phase = row[0]?.phase;
            return row.map((week) => (
              <div
                key={week.index}
                style={{
                  backgroundColor: phase ? PHASE_COLORS[phase] : undefined,
                }}
              >
                <LifeGridCell week={week} />
              </div>
            ));
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-future-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#404040' }} />
          <span className="text-[10px] text-text-muted">Lived</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: '#e5e5e5', boxShadow: '0 0 3px rgba(229,229,229,0.4)' }}
          />
          <span className="text-[10px] text-text-muted">Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: '#1a1a1a', border: '0.5px solid #262626' }}
          />
          <span className="text-[10px] text-text-muted">Future</span>
        </div>
        <div className="ml-auto text-[10px] text-text-muted">
          Each cell = 1 week. Each row = 1 year.
        </div>
      </div>
    </motion.div>
  );
}
