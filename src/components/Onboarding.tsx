import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeConfig, $timeAllocation, $relationships, $hasOnboarded, $theme } from '../stores/life';
import TimeSlider from './TimeSlider';
import ThemeToggle from './ThemeToggle';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/constants';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

const STEPS = 5;

export default function Onboarding() {
  const config = useStore($lifeConfig);
  const allocation = useStore($timeAllocation);
  const rels = useStore($relationships);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = () => {
    if (step < STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      $hasOnboarded.set('true');
      window.location.href = '/dashboard';
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const totalAllocated = Object.values(allocation).reduce(
    (sum, val) => sum + Number(val),
    0
  );

  const isStep1Valid = config.name.trim() !== '' && config.birthDate !== '';

  const inputClass =
    'w-full rounded-lg px-4 py-3 focus:outline-none transition-colors text-sm';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Theme toggle top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex justify-center gap-2.5 mb-16">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i <= step ? '32px' : '8px',
                backgroundColor: i <= step ? 'var(--th-text)' : 'var(--th-border)',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Step 0: Name + Birth Date */}
            {step === 0 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Let's begin
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    First, tell us a bit about yourself.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs block" style={{ color: 'var(--th-text-muted)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={config.name}
                      onChange={(e) => $lifeConfig.setKey('name', e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: 'var(--th-surface)',
                        border: '1px solid var(--th-border)',
                        color: 'var(--th-text)',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs block" style={{ color: 'var(--th-text-muted)' }}>
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={config.birthDate}
                      onChange={(e) => $lifeConfig.setKey('birthDate', e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: 'var(--th-surface)',
                        border: '1px solid var(--th-border)',
                        color: 'var(--th-text)',
                      }}
                    />
                  </div>

                  <TimeSlider
                    label="Life Expectancy"
                    value={Number(config.lifeExpectancy)}
                    min={50}
                    max={100}
                    step={1}
                    unit="years"
                    onChange={(v) => $lifeConfig.setKey('lifeExpectancy', String(v))}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Retirement */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    When will you retire?
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    This shapes how your remaining work time is calculated.
                  </p>
                </div>

                <div className="space-y-8">
                  <TimeSlider
                    label="Retirement Age"
                    value={Number(config.retirementAge)}
                    min={30}
                    max={80}
                    step={1}
                    unit="years old"
                    onChange={(v) => $lifeConfig.setKey('retirementAge', String(v))}
                  />

                  <div
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: 'var(--th-surface)',
                      border: '1px solid var(--th-border)',
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                      The average global retirement age is 63-65.
                      This determines when "work hours" stop counting in your time breakdown.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Relationships */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Your relationships
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    How often do you see the people who matter most?
                  </p>
                </div>

                <div className="space-y-6">
                  <TimeSlider
                    label="Your parents' current age"
                    value={Number(rels.parentsAge)}
                    min={30}
                    max={100}
                    step={1}
                    unit="years"
                    color={CATEGORY_COLORS.parents}
                    onChange={(v) => $relationships.setKey('parentsAge', String(v))}
                  />

                  <TimeSlider
                    label="Parents' life expectancy"
                    value={Number(rels.parentsLifeExpectancy)}
                    min={50}
                    max={100}
                    step={1}
                    unit="years"
                    color={CATEGORY_COLORS.parents}
                    onChange={(v) => $relationships.setKey('parentsLifeExpectancy', String(v))}
                  />

                  <TimeSlider
                    label="Times you see your parents per year"
                    value={Number(rels.parentVisitsPerYear)}
                    min={0}
                    max={52}
                    step={1}
                    unit="times/year"
                    color={CATEGORY_COLORS.parents}
                    onChange={(v) => $relationships.setKey('parentVisitsPerYear', String(v))}
                  />

                  <div
                    className="rounded-xl p-5"
                    style={{
                      backgroundColor: 'var(--th-surface)',
                      border: '1px solid var(--th-border)',
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                      If your parents are {rels.parentsAge} and you see them{' '}
                      {rels.parentVisitsPerYear} times a year, you have roughly{' '}
                      <strong style={{ color: CATEGORY_COLORS.parents }}>
                        {Math.max(0, Math.round((Number(rels.parentsLifeExpectancy) - Number(rels.parentsAge)) * Number(rels.parentVisitsPerYear)))}
                      </strong>{' '}
                      visits left.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Phone / Screen Time */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Screen time
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    How much of your day goes to your phone?
                  </p>
                </div>

                <div className="space-y-8">
                  <TimeSlider
                    label="Phone / screen time"
                    value={Number(rels.phoneHoursPerDay)}
                    min={0}
                    max={12}
                    step={0.5}
                    unit="hrs/day"
                    color={CATEGORY_COLORS.phone}
                    onChange={(v) => $relationships.setKey('phoneHoursPerDay', String(v))}
                  />

                  <div
                    className="rounded-xl p-5 space-y-3"
                    style={{
                      backgroundColor: 'var(--th-surface)',
                      border: '1px solid var(--th-border)',
                    }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                      The average person spends ~4 hours/day on their phone.
                      That's roughly <strong style={{ color: CATEGORY_COLORS.phone }}>
                        {Math.round((Number(rels.phoneHoursPerDay) / 24) * 365)} days per year
                      </strong> — just staring at a screen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Daily Time Allocation */}
            {step === 4 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Your typical day
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    Average hours per day for each activity.
                  </p>
                </div>

                <div className="space-y-5">
                  {(Object.keys(allocation) as Array<keyof typeof allocation>).map(
                    (key) => (
                      <TimeSlider
                        key={key}
                        label={CATEGORY_LABELS[key] || key}
                        value={Number(allocation[key])}
                        min={0}
                        max={16}
                        step={0.5}
                        color={CATEGORY_COLORS[key]}
                        onChange={(v) => $timeAllocation.setKey(key, String(v))}
                      />
                    )
                  )}
                </div>

                <div
                  className="rounded-xl p-5"
                  style={{
                    backgroundColor: 'var(--th-surface)',
                    border: '1px solid var(--th-border)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--th-text-muted)' }}>
                      Total allocated
                    </span>
                    <span
                      className="text-sm font-medium tabular-nums"
                      style={{
                        color:
                          totalAllocated > 24
                            ? '#e06c75'
                            : totalAllocated > 22
                              ? '#8f8b6b'
                              : 'var(--th-text)',
                      }}
                    >
                      {totalAllocated}/24 hrs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-16">
          <button
            onClick={prev}
            className="px-6 py-3 text-sm rounded-lg transition-colors"
            style={{
              visibility: step > 0 ? 'visible' : 'hidden',
              color: 'var(--th-text-muted)',
            }}
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={step === 0 && !isStep1Valid}
            className="px-8 py-3 text-sm rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--th-accent)',
              color: 'var(--th-accent-inv)',
            }}
          >
            {step < STEPS - 1 ? 'Continue' : 'See Your Life'}
          </button>
        </div>
      </div>
    </div>
  );
}
