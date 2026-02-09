import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeStats, $relationships } from '../stores/life';
import { CATEGORY_COLORS } from '../lib/constants';

interface InsightCardProps {
  emoji: string;
  value: string | number;
  label: string;
  sublabel?: string;
  color: string;
  delay?: number;
}

function InsightCard({ emoji, value, label, sublabel, color, delay = 0 }: InsightCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-6 space-y-3"
      style={{
        backgroundColor: 'var(--th-surface)',
        border: '1px solid var(--th-border)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      <div className="text-2xl">{emoji}</div>
      <div>
        <div className="text-2xl font-medium tabular-nums" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--th-text-muted)' }}>
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] mt-1" style={{ color: 'var(--th-text-muted)', opacity: 0.7 }}>
            {sublabel}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function InsightCards() {
  const stats = useStore($lifeStats);
  const rels = useStore($relationships);

  if (!stats) return null;

  const parentsAlive = rels.parentsAlive || 'both';
  const parentLabel = parentsAlive === 'one' ? 'parent' : 'parents';

  return (
    <div className="space-y-4">
      <motion.h2
        className="text-sm font-medium"
        style={{ color: 'var(--th-text)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Reality Check
      </motion.h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {parentsAlive !== 'neither' && (
          <InsightCard
            emoji={"\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"}
            value={stats.parentVisitsLeft}
            label={`visits with ${parentLabel} left`}
            sublabel={`Seeing them ${rels.parentVisitsPerYear}x/year for ~${stats.parentYearsLeft} more years`}
            color={CATEGORY_COLORS.parents}
            delay={0.5}
          />
        )}

        <InsightCard
          emoji={"\uD83D\uDCF1"}
          value={`${stats.phoneYearsTotal} years`}
          label="of remaining life on your phone"
          sublabel={`${stats.phoneWeeksTotal.toLocaleString()} weeks staring at a screen`}
          color={CATEGORY_COLORS.phone}
          delay={0.6}
        />

        <InsightCard
          emoji={"\uD83C\uDF85"}
          value={stats.christmasesLeft}
          label="Christmases remaining"
          sublabel="Make each one count"
          color="#6b8f71"
          delay={0.7}
        />

        <InsightCard
          emoji={"\uD83D\uDCDA"}
          value={stats.booksLeft.toLocaleString()}
          label="books you could still read"
          sublabel="At ~12 books per year"
          color="#6b7e8f"
          delay={0.8}
        />

        <InsightCard
          emoji={"\uD83C\uDF15"}
          value={stats.fullMoonsLeft.toLocaleString()}
          label="full moons left to see"
          sublabel="One every ~29.5 days"
          color="#8b7355"
          delay={0.9}
        />

        <InsightCard
          emoji={"\u2600\uFE0F"}
          value={stats.summersLeft}
          label="summers remaining"
          sublabel="Each one flies faster than the last"
          color="#8f8b6b"
          delay={1.0}
        />

        <InsightCard
          emoji={"\uD83D\uDECC"}
          value={`${Math.round(stats.categoryBreakdown.sleep / 52)} yrs`}
          label="of remaining life sleeping"
          sublabel={`${stats.categoryBreakdown.sleep?.toLocaleString()} weeks in bed`}
          color={CATEGORY_COLORS.sleep}
          delay={1.1}
        />

        <InsightCard
          emoji={"\uD83D\uDCBC"}
          value={`${Math.round((stats.categoryBreakdown.work || 0) / 52)} yrs`}
          label="of remaining life working"
          sublabel={`${(stats.categoryBreakdown.work || 0).toLocaleString()} weeks at work`}
          color={CATEGORY_COLORS.work}
          delay={1.2}
        />
      </div>
    </div>
  );
}
