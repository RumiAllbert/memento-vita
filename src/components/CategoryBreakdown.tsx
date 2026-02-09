import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeStats } from '../stores/life';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/constants';

export default function CategoryBreakdown() {
  const stats = useStore($lifeStats);

  if (!stats) return null;

  const { categoryBreakdown, weeksRemaining } = stats;
  const categories = Object.entries(categoryBreakdown);
  const maxWeeks = Math.max(...Object.values(categoryBreakdown));

  return (
    <motion.div
      className="bg-surface rounded-xl p-6 border border-future-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
    >
      <div className="space-y-1 mb-6">
        <h2 className="text-sm font-medium text-text-primary">
          Time Breakdown
        </h2>
        <p className="text-xs text-text-muted">
          Of your remaining {weeksRemaining.toLocaleString()} weeks...
        </p>
      </div>

      <div className="space-y-3">
        {categories.map(([key, weeks], i) => {
          const percentage = maxWeeks > 0 ? (weeks / weeksRemaining) * 100 : 0;
          const color = CATEGORY_COLORS[key] || '#525252';
          const label = CATEGORY_LABELS[key] || key;

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-text-muted">{label}</span>
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{ color }}
                >
                  {weeks.toLocaleString()} weeks
                </span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
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
    </motion.div>
  );
}
