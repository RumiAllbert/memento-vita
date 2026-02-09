import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeStats, $highlightedCategory } from '../stores/life';
import { getCategoryColor, getCategoryLabel, getCategoryEmoji } from '../lib/constants';

export default function CategoryBreakdown() {
  const stats = useStore($lifeStats);
  const highlighted = useStore($highlightedCategory);

  if (!stats) return null;

  const { categoryBreakdown, weeksRemaining } = stats;
  const categories = Object.entries(categoryBreakdown);

  return (
    <motion.div
      className="rounded-2xl p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--th-surface)',
        border: '1px solid var(--th-border)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
    >
      <div className="space-y-1 mb-8">
        <h2 className="text-sm font-medium" style={{ color: 'var(--th-text)' }}>
          Time Breakdown
        </h2>
        <p className="text-xs" style={{ color: 'var(--th-text-muted)' }}>
          {highlighted
            ? `${getCategoryEmoji(highlighted)} ${categoryBreakdown[highlighted]?.toLocaleString() || 0} weeks of ${getCategoryLabel(highlighted)} shown on the grid`
            : `Of your remaining ${weeksRemaining.toLocaleString()} weeks...`}
        </p>
      </div>

      <div className="space-y-4">
        {categories.map(([key, weeks], i) => {
          const percentage = weeksRemaining > 0 ? (weeks / weeksRemaining) * 100 : 0;
          const color = getCategoryColor(key);
          const label = getCategoryLabel(key);
          const emoji = getCategoryEmoji(key);
          const isActive = highlighted === key;
          const isDimmed = highlighted !== null && !isActive;

          return (
            <div
              key={key}
              className="space-y-1.5 rounded-lg px-3 py-2.5 -mx-3 sm:px-2 sm:py-1.5 sm:-mx-2 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isActive ? `${color}15` : 'transparent',
                opacity: isDimmed ? 0.4 : 1,
              }}
              onMouseEnter={() => $highlightedCategory.set(key)}
              onMouseLeave={() => $highlightedCategory.set(null)}
              onClick={() => $highlightedCategory.set(isActive ? null : key)}
            >
              <div className="flex justify-between items-baseline">
                <span className="text-xs" style={{ color: isActive ? color : 'var(--th-text-muted)' }}>
                  {emoji} {label}
                </span>
                <span className="text-xs font-medium tabular-nums" style={{ color }}>
                  {weeks.toLocaleString()} wks
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--th-future)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.6 + i * 0.08,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stacked overview bar */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6" style={{ borderTop: '1px solid var(--th-border)' }}>
        <p className="text-[10px] mb-3" style={{ color: 'var(--th-text-muted)' }}>
          Tap a category to see it on the life grid
        </p>
        <div className="flex h-4 rounded-full overflow-hidden">
          {categories.map(([key, weeks]) => {
            const percentage = weeksRemaining > 0 ? (weeks / weeksRemaining) * 100 : 0;
            if (percentage < 0.5) return null;
            const isActive = highlighted === key;
            return (
              <motion.div
                key={key}
                className="cursor-pointer transition-opacity duration-200"
                style={{
                  backgroundColor: getCategoryColor(key),
                  opacity: highlighted && !isActive ? 0.3 : 1,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 }}
                title={`${getCategoryLabel(key)}: ${percentage.toFixed(1)}%`}
                onMouseEnter={() => $highlightedCategory.set(key)}
                onMouseLeave={() => $highlightedCategory.set(null)}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
