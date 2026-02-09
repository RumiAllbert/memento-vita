import { useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $parsedConfig, $viewMode, $highlightedCategory, $lifeStats } from '../stores/life';
import {
  generateWeekData,
  generateMonthData,
  generateYearData,
} from '../lib/calculations';
import {
  WEEKS_PER_YEAR,
  MONTHS_PER_YEAR,
  getCategoryColor,
} from '../lib/constants';
import { MemoWeekCell, MemoMonthCell, MemoYearCell } from './LifeGridCell';
import ViewSwitcher from './ViewSwitcher';
import type { ViewMode } from '../lib/constants';

const VIEW_ORDER: ViewMode[] = ['years', 'months', 'weeks'];

export default function LifeGrid() {
  const config = useStore($parsedConfig);
  const viewMode = useStore($viewMode) as ViewMode;
  const highlighted = useStore($highlightedCategory);
  const stats = useStore($lifeStats);
  const gridRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => (viewMode === 'weeks' ? generateWeekData(config) : []), [config, viewMode]);
  const months = useMemo(() => (viewMode === 'months' ? generateMonthData(config) : []), [config, viewMode]);
  const years = useMemo(() => (viewMode === 'years' ? generateYearData(config) : []), [config, viewMode]);

  // Pre-compute highlight data once for all cells
  const currentWeekIndex = stats?.currentWeekIndex ?? 0;
  const highlightedCategoryWeeks = useMemo(
    () => (highlighted && stats) ? (stats.categoryBreakdown[highlighted] || 0) : 0,
    [highlighted, stats]
  );
  const highlightedColor = highlighted ? getCategoryColor(highlighted) : undefined;
  const currentMonthIndex = useMemo(() => Math.floor(currentWeekIndex / 4.33), [currentWeekIndex]);
  const highlightedCategoryMonths = useMemo(() => Math.round(highlightedCategoryWeeks / 4.33), [highlightedCategoryWeeks]);
  const currentYearIndex = useMemo(() => Math.floor(currentWeekIndex / 52), [currentWeekIndex]);
  const highlightedCategoryYears = useMemo(() => Math.round(highlightedCategoryWeeks / 52), [highlightedCategoryWeeks]);

  // Scroll-wheel zoom
  const lastWheel = useRef(0);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheel.current < 400) return; // debounce
      const idx = VIEW_ORDER.indexOf(viewMode);
      if (e.deltaY > 0 && idx < VIEW_ORDER.length - 1) {
        // scroll down → zoom in
        lastWheel.current = now;
        $viewMode.set(VIEW_ORDER[idx + 1]);
      } else if (e.deltaY < 0 && idx > 0) {
        // scroll up → zoom out
        lastWheel.current = now;
        $viewMode.set(VIEW_ORDER[idx - 1]);
      }
    },
    [viewMode]
  );

  if (!config.birthDate) return null;

  const totalYears = config.lifeExpectancy;

  return (
    <motion.div
      className="rounded-2xl p-3 sm:p-6 overflow-x-auto"
      style={{
        backgroundColor: 'var(--th-surface)',
        border: '1px solid var(--th-border)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
            Your Life in {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
          </h2>
          <p className="text-[10px] mt-1" style={{ color: 'var(--th-text-muted)' }}>
            {viewMode === 'weeks' && 'Each cell = 1 week. Each row = 1 year. Scroll to zoom.'}
            {viewMode === 'months' && 'Each cell = 1 month. Each row = 1 year. Scroll to zoom.'}
            {viewMode === 'years' && 'Each cell = 1 year of your life. Scroll to zoom.'}
          </p>
        </div>
        <ViewSwitcher />
      </div>

      {/* Grid with scroll-wheel zoom */}
      <div ref={gridRef} onWheel={handleWheel}>
        <AnimatePresence mode="wait">
          {/* Week view */}
          {viewMode === 'weeks' && (
            <motion.div
              key="weeks"
              className="flex gap-1 min-w-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col shrink-0" style={{ gap: '1px' }}>
                {Array.from({ length: totalYears }, (_, year) => (
                  <div
                    key={year}
                    className="flex items-center justify-end pr-2"
                    style={{ height: '7px', width: '28px' }}
                  >
                    {year % 5 === 0 && (
                      <span className="text-[7px] leading-none tabular-nums" style={{ color: 'var(--th-text-muted)' }}>
                        {year}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="grid flex-1 min-w-0"
                style={{ gridTemplateColumns: `repeat(${WEEKS_PER_YEAR}, 1fr)`, gap: '1px' }}
              >
                {weeks.map((week) => (
                  <MemoWeekCell
                    key={week.index}
                    week={week}
                    highlighted={highlighted}
                    currentWeekIndex={currentWeekIndex}
                    highlightedCategoryWeeks={highlightedCategoryWeeks}
                    highlightedColor={highlightedColor}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Month view */}
          {viewMode === 'months' && (
            <motion.div
              key="months"
              className="flex gap-1.5 min-w-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col shrink-0" style={{ gap: '2px' }}>
                {Array.from({ length: totalYears }, (_, year) => (
                  <div key={year} className="flex items-center justify-end pr-2" style={{ height: '14px', width: '28px' }}>
                    {year % 5 === 0 && (
                      <span className="text-[8px] leading-none tabular-nums" style={{ color: 'var(--th-text-muted)' }}>
                        {year}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="grid flex-1 min-w-0"
                style={{ gridTemplateColumns: `repeat(${MONTHS_PER_YEAR}, 1fr)`, gap: '2px' }}
              >
                {months.map((month) => (
                  <MemoMonthCell
                    key={month.index}
                    month={month}
                    highlighted={highlighted}
                    highlightedCategoryMonths={highlightedCategoryMonths}
                    currentMonthIndex={currentMonthIndex}
                    highlightedColor={highlightedColor}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Year view */}
          {viewMode === 'years' && (
            <motion.div
              key="years"
              className="grid"
              style={{ gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px', maxWidth: '500px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {years.map((year) => (
                <MemoYearCell
                  key={year.index}
                  year={year}
                  highlighted={highlighted}
                  highlightedCategoryYears={highlightedCategoryYears}
                  currentYearIndex={currentYearIndex}
                  highlightedColor={highlightedColor}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-3 sm:gap-5 mt-4 sm:mt-6 pt-3 sm:pt-4"
        style={{ borderTop: '1px solid var(--th-border)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--th-lived)' }} />
          <span className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>Lived</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--th-current)', boxShadow: '0 0 3px var(--th-current-shadow)' }} />
          <span className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--th-future)', border: '0.5px solid var(--th-border)' }} />
          <span className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>Future</span>
        </div>
      </div>
    </motion.div>
  );
}
