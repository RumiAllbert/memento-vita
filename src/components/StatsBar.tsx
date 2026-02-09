import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeStats, $lifeConfig } from '../stores/life';
import ProgressRing from './ProgressRing';

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <motion.span
      className="tabular-nums"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

interface StatCardProps {
  label: string;
  children: React.ReactNode;
  delay?: number;
}

function StatCard({ label, children, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: 'var(--th-surface)',
        border: '1px solid var(--th-border)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      <div className="text-2xl font-medium" style={{ color: 'var(--th-text)' }}>
        {children}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--th-text-muted)' }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function StatsBar() {
  const stats = useStore($lifeStats);
  const config = useStore($lifeConfig);

  if (!stats) return null;

  const firstName = config.name.split(' ')[0] || 'there';

  return (
    <div className="space-y-4">
      <motion.p
        className="text-sm"
        style={{ color: 'var(--th-text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        Hey {firstName}, here's your life at a glance.
      </motion.p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="weeks lived" delay={0}>
          <AnimatedNumber value={stats.weeksLived} />
        </StatCard>

        <StatCard label="weeks remaining" delay={0.1}>
          <AnimatedNumber value={stats.weeksRemaining} delay={0.1} />
        </StatCard>

        <StatCard label="summers left" delay={0.2}>
          ~<AnimatedNumber value={stats.summersLeft} delay={0.2} />
        </StatCard>

        <StatCard label="weekends remaining" delay={0.3}>
          ~<AnimatedNumber value={stats.weekendsLeft} delay={0.3} />
        </StatCard>

        <motion.div
          className="rounded-2xl p-6 flex items-center justify-center col-span-2 lg:col-span-1"
          style={{
            backgroundColor: 'var(--th-surface)',
            border: '1px solid var(--th-border)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
        >
          <ProgressRing percent={stats.percentLived} size={100} />
        </motion.div>
      </div>
    </div>
  );
}
