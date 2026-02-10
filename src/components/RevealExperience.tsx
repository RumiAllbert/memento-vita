import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeConfig, $lifeStats, $hasSeenReveal, $relationships } from '../stores/life';
import { CATEGORY_COLORS } from '../lib/constants';

// ---- AnimatedCounter ----

function AnimatedCounter({
  target,
  decimals = 0,
  duration = 2000,
  suffix = '',
  prefix = '',
  color,
}: {
  target: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  color?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} style={{ color }}>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}
      {suffix}
    </span>
  );
}

// ---- ProgressBar ----

function ProgressBar({ percent, color }: { percent: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div
      ref={ref}
      className="w-full h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: 'var(--th-border)' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color || 'var(--th-accent)' }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${percent}%` } : { width: 0 }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
      />
    </div>
  );
}

// ---- Section wrapper ----

function RevealSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section
      ref={ref}
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-24 ${className}`}
    >
      <motion.div
        className="max-w-lg w-full text-center space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

// ---- Main Component ----

export default function RevealExperience() {
  const config = useStore($lifeConfig);
  const stats = useStore($lifeStats);
  const rels = useStore($relationships);

  if (!stats) return null;

  const name = config.name || 'friend';
  const parentVisitsLeft = stats.parentVisitsLeft;
  const freeWeeks = stats.categoryBreakdown.free ?? 0;
  const motherAlive = rels.motherAlive === 'true';
  const fatherAlive = rels.fatherAlive === 'true';
  const anyParentAlive = motherAlive || fatherAlive;
  const parentLabel = motherAlive && fatherAlive ? 'parents' : motherAlive ? 'mom' : 'dad';

  const handleContinue = () => {
    $hasSeenReveal.set('true');
    window.location.href = '/dashboard';
  };

  return (
    <div>
      {/* 1. Greeting */}
      <RevealSection>
        <p className="text-sm tracking-wide uppercase" style={{ color: 'var(--th-text-muted)' }}>
          memento vitae
        </p>
        <h1 className="text-4xl md:text-5xl font-medium leading-tight" style={{ color: 'var(--th-text)' }}>
          Hey {name},
          <br />
          let's look at your life.
        </h1>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          Scroll down
        </p>
        <motion.div
          className="mt-4"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </RevealSection>

      {/* 2. Weeks Lived */}
      <RevealSection>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          You have lived
        </p>
        <div className="text-6xl md:text-7xl font-medium tabular-nums" style={{ color: 'var(--th-text)' }}>
          <AnimatedCounter target={stats.weeksLived} duration={2500} />
        </div>
        <p className="text-xl" style={{ color: 'var(--th-text)' }}>
          weeks
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
          That's every laugh, every meal, every sunrise.
        </p>
      </RevealSection>

      {/* 3. Life Progress */}
      <RevealSection>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          Your life is
        </p>
        <div className="text-6xl md:text-7xl font-medium tabular-nums" style={{ color: 'var(--th-text)' }}>
          <AnimatedCounter target={stats.percentLived} decimals={1} duration={2000} suffix="%" />
        </div>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          behind you
        </p>
        <div className="pt-4">
          <ProgressBar percent={stats.percentLived} />
        </div>
      </RevealSection>

      {/* 4. Summers Left */}
      <RevealSection>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          You have roughly
        </p>
        <div className="text-6xl md:text-7xl font-medium tabular-nums">
          <AnimatedCounter target={stats.summersLeft} duration={2000} prefix="~" color="#8f8b6b" />
        </div>
        <p className="text-xl" style={{ color: '#8f8b6b' }}>
          summers left
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
          Each one a little more precious than the last.
        </p>
      </RevealSection>

      {/* 5. Parent Visits */}
      {anyParentAlive && (
        <RevealSection>
          <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
            If you keep visiting your {parentLabel}
          </p>
          <div className="text-6xl md:text-7xl font-medium tabular-nums">
            <AnimatedCounter target={parentVisitsLeft} duration={2000} prefix="~" color={CATEGORY_COLORS.parents} />
          </div>
          <p className="text-xl" style={{ color: CATEGORY_COLORS.parents }}>
            more times
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
            Make each visit count.
          </p>
        </RevealSection>
      )}

      {/* 6. Phone Time */}
      <RevealSection>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          At your current screen time, you'll spend
        </p>
        <div className="text-6xl md:text-7xl font-medium tabular-nums">
          <AnimatedCounter target={stats.phoneYearsTotal} decimals={1} duration={2000} prefix="~" color={CATEGORY_COLORS.phone} />
        </div>
        <p className="text-xl" style={{ color: CATEGORY_COLORS.phone }}>
          years staring at your phone
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
          That's time you'll never get back.
        </p>
      </RevealSection>

      {/* 7. Free Time */}
      <RevealSection>
        <p className="text-sm" style={{ color: 'var(--th-text-muted)' }}>
          After sleep, work, and obligations
        </p>
        <div className="text-6xl md:text-7xl font-medium tabular-nums">
          <AnimatedCounter target={freeWeeks} duration={2000} color={CATEGORY_COLORS.free} />
        </div>
        <p className="text-xl" style={{ color: CATEGORY_COLORS.free }}>
          weeks of truly free time
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
          This is what's yours. Spend it wisely.
        </p>
      </RevealSection>

      {/* 8. Seneca Quote */}
      <RevealSection>
        <div className="space-y-6">
          <div
            className="w-12 h-px mx-auto"
            style={{ backgroundColor: 'var(--th-border)' }}
          />
          <p
            className="text-lg md:text-xl italic leading-relaxed tracking-wide"
            style={{ color: 'var(--th-text)' }}
          >
            "Non exiguum tempus habemus,
            <br />
            sed multum perdidimus."
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--th-text-muted)' }}
          >
            "It is not that we have a short time to live,
            <br />
            but that we waste a great deal of it."
          </p>
          <p
            className="text-[10px] tracking-widest uppercase"
            style={{ color: 'var(--th-text-muted)', opacity: 0.5 }}
          >
            Seneca, On the Shortness of Life
          </p>
          <div
            className="w-12 h-px mx-auto"
            style={{ backgroundColor: 'var(--th-border)' }}
          />
        </div>
      </RevealSection>

      {/* 9. CTA */}
      <RevealSection>
        <h2 className="text-3xl md:text-4xl font-medium leading-tight" style={{ color: 'var(--th-text)' }}>
          Now let's see your whole life at a glance.
        </h2>
        <div className="pt-4">
          <button
            onClick={handleContinue}
            className="px-10 py-4 text-sm rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'var(--th-accent)',
              color: 'var(--th-accent-inv)',
            }}
          >
            View Your Life Grid
          </button>
        </div>
      </RevealSection>
    </div>
  );
}
