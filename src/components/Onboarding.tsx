import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import {
  $lifeConfig,
  $timeAllocation,
  $relationships,
  $hasOnboarded,
  $customCategories,
  $parsedCustomCategories,
} from '../stores/life';
import TimeSlider from './TimeSlider';
import ThemeToggle from './ThemeToggle';
import IntroAnimation from './IntroAnimation';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CUSTOM_CATEGORY_PALETTE,
  MAX_CUSTOM_CATEGORIES,
  getCategoryColor,
  getCategoryLabel,
  getCategoryEmoji,
  type CustomCategory,
} from '../lib/constants';
import { AVERAGES, getComparison } from '../lib/stats';

// ---- PillSelector ----

function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 sm:px-5 py-2.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: selected ? 'var(--th-accent)' : 'var(--th-surface)',
              color: selected ? 'var(--th-accent-inv)' : 'var(--th-text-muted)',
              border: `1px solid ${selected ? 'var(--th-accent)' : 'var(--th-border)'}`,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// Small helper for the contextual hint boxes
function Hint({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--th-surface)',
        border: '1px solid var(--th-border)',
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={String(children)}
    >
      <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
        {children}
      </p>
    </motion.div>
  );
}

const STEPS = 5;

export default function Onboarding() {
  const config = useStore($lifeConfig);
  const allocation = useStore($timeAllocation);
  const rels = useStore($relationships);
  const customCats = useStore($parsedCustomCategories);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showIntro, setShowIntro] = useState(true);

  // Custom category form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('');
  const [catColor, setCatColor] = useState(CUSTOM_CATEGORY_PALETTE[0]);

  const next = () => {
    if (step < STEPS - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      $hasOnboarded.set('true');
      window.location.href = '/reveal';
    }
  };

  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const totalAllocated =
    Object.values(allocation).reduce((sum, val) => sum + Number(val), 0) +
    customCats.reduce((sum, cat) => sum + cat.hours, 0);

  const isStep1Valid = (config.name || '').trim() !== '' && config.birthDate !== '';

  const inputClass =
    'w-full rounded-lg px-4 py-3 focus:outline-none transition-colors text-sm';

  const lifeExp = Number(config.lifeExpectancy);
  const retAge = Number(config.retirementAge);
  const phoneHrs = Number(rels.phoneHoursPerDay);
  const motherAlive = (rels.motherAlive || 'true') as 'true' | 'false';
  const fatherAlive = (rels.fatherAlive || 'true') as 'true' | 'false';
  const anyParentAlive = motherAlive === 'true' || fatherAlive === 'true';

  // Compute visits for hint
  const motherVisits = motherAlive === 'true'
    ? Math.max(0, Math.round((Number(rels.motherLifeExpectancy) - Number(rels.motherAge)) * Number(rels.motherVisitsPerYear)))
    : 0;
  const fatherVisits = fatherAlive === 'true'
    ? Math.max(0, Math.round((Number(rels.fatherLifeExpectancy) - Number(rels.fatherAge)) * Number(rels.fatherVisitsPerYear)))
    : 0;
  const totalVisitsLeft = motherVisits + fatherVisits;

  const addCustomCategory = () => {
    if (!catName.trim() || !catEmoji.trim()) return;
    const id = 'custom-' + catName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newCat: CustomCategory = {
      id,
      label: catName.trim(),
      emoji: catEmoji.trim(),
      color: catColor,
      hours: 1,
    };
    const updated = [...customCats, newCat];
    $customCategories.set(JSON.stringify(updated));
    setCatName('');
    setCatEmoji('');
    setCatColor(CUSTOM_CATEGORY_PALETTE[0]);
    setShowCatForm(false);
  };

  const removeCustomCategory = (id: string) => {
    const updated = customCats.filter((c) => c.id !== id);
    $customCategories.set(JSON.stringify(updated));
  };

  const updateCustomCategoryHours = (id: string, hours: number) => {
    const updated = customCats.map((c) => (c.id === id ? { ...c, hours } : c));
    $customCategories.set(JSON.stringify(updated));
  };

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <IntroAnimation onComplete={() => setShowIntro(false)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      data-onboarding
      className="min-h-screen flex flex-col items-center justify-center px-5 py-6 sm:px-6"
      style={{ overflowX: 'hidden' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        <div className="flex justify-center gap-2.5 mb-10 sm:mb-16">
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
            {/* Step 0: Name + Birth Date + Life Expectancy */}
            {step === 0 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
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
                      value={config.name || ''}
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
                      value={config.birthDate || ''}
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
                    value={lifeExp}
                    min={50}
                    max={100}
                    step={1}
                    unit="years"
                    onChange={(v) => $lifeConfig.setKey('lifeExpectancy', String(v))}
                  />

                  <Hint>
                    {AVERAGES.lifeExpectancy.label}{' '}
                    {getComparison('lifeExpectancy', lifeExp)}
                  </Hint>
                </div>
              </div>
            )}

            {/* Step 1: Retirement */}
            {step === 1 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    When will you retire?
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    This shapes how your remaining work time is calculated.
                  </p>
                </div>

                <div className="space-y-8">
                  <TimeSlider
                    label="Retirement Age"
                    value={retAge}
                    min={30}
                    max={80}
                    step={1}
                    unit="years old"
                    onChange={(v) => $lifeConfig.setKey('retirementAge', String(v))}
                  />

                  <Hint>
                    {AVERAGES.retirementAge.label}{' '}
                    {getComparison('retirementAge', retAge)}
                  </Hint>
                </div>
              </div>
            )}

            {/* Step 2: Relationships (split mother/father) */}
            {step === 2 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Your parents
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    Tell us about your parents so we can estimate visits remaining.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Mother */}
                  <div className="space-y-4">
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: 'var(--th-surface)',
                        border: '1px solid var(--th-border)',
                      }}
                    >
                      <span className="text-xs shrink-0" style={{ color: 'var(--th-text-muted)' }}>
                        Is your mother alive?
                      </span>
                      <PillSelector
                        options={[
                          { value: 'true' as const, label: 'Yes' },
                          { value: 'false' as const, label: 'No' },
                        ]}
                        value={motherAlive}
                        onChange={(v) => $relationships.setKey('motherAlive', v)}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {motherAlive === 'true' && (
                        <motion.div
                          key="mother-fields"
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TimeSlider
                            label="Mother's age"
                            value={Number(rels.motherAge)}
                            min={30}
                            max={100}
                            step={1}
                            unit="years"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('motherAge', String(v))}
                          />
                          <TimeSlider
                            label="Mother's life expectancy"
                            value={Number(rels.motherLifeExpectancy)}
                            min={50}
                            max={100}
                            step={1}
                            unit="years"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('motherLifeExpectancy', String(v))}
                          />
                          <TimeSlider
                            label="See mother per year"
                            value={Number(rels.motherVisitsPerYear)}
                            min={0}
                            max={52}
                            step={1}
                            unit="times/yr"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('motherVisitsPerYear', String(v))}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Father */}
                  <div className="space-y-4">
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: 'var(--th-surface)',
                        border: '1px solid var(--th-border)',
                      }}
                    >
                      <span className="text-xs shrink-0" style={{ color: 'var(--th-text-muted)' }}>
                        Is your father alive?
                      </span>
                      <PillSelector
                        options={[
                          { value: 'true' as const, label: 'Yes' },
                          { value: 'false' as const, label: 'No' },
                        ]}
                        value={fatherAlive}
                        onChange={(v) => $relationships.setKey('fatherAlive', v)}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      {fatherAlive === 'true' && (
                        <motion.div
                          key="father-fields"
                          className="space-y-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <TimeSlider
                            label="Father's age"
                            value={Number(rels.fatherAge)}
                            min={30}
                            max={100}
                            step={1}
                            unit="years"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('fatherAge', String(v))}
                          />
                          <TimeSlider
                            label="Father's life expectancy"
                            value={Number(rels.fatherLifeExpectancy)}
                            min={50}
                            max={100}
                            step={1}
                            unit="years"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('fatherLifeExpectancy', String(v))}
                          />
                          <TimeSlider
                            label="See father per year"
                            value={Number(rels.fatherVisitsPerYear)}
                            min={0}
                            max={52}
                            step={1}
                            unit="times/yr"
                            color={CATEGORY_COLORS.parents}
                            onChange={(v) => $relationships.setKey('fatherVisitsPerYear', String(v))}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {!anyParentAlive ? (
                  <Hint>
                    We're sorry for your loss. We'll skip parent-related sections throughout the app.
                  </Hint>
                ) : (
                  <Hint>
                    {AVERAGES.parentVisits.label} You have roughly{' '}
                    <strong style={{ color: CATEGORY_COLORS.parents }}>
                      {totalVisitsLeft} visits
                    </strong>{' '}
                    left{motherAlive === 'true' && fatherAlive === 'true' ? ` (Mom: ${motherVisits}, Dad: ${fatherVisits})` : ''}.
                    Make them count.
                  </Hint>
                )}
              </div>
            )}

            {/* Step 3: Phone / Screen Time */}
            {step === 3 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Screen time
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    How much of your day goes to your phone?
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <TimeSlider
                      label="Phone / screen time"
                      value={phoneHrs}
                      min={0}
                      max={12}
                      step={0.5}
                      unit="hrs/day"
                      color={CATEGORY_COLORS.phone}
                      onChange={(v) => $relationships.setKey('phoneHoursPerDay', String(v))}
                    />
                    {getComparison('phone', phoneHrs) && (
                      <motion.p
                        className="text-[11px] pl-1"
                        style={{ color: CATEGORY_COLORS.phone }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={phoneHrs}
                      >
                        {getComparison('phone', phoneHrs)}
                      </motion.p>
                    )}
                  </div>

                  <Hint>
                    {AVERAGES.phone.label} At {phoneHrs} hrs/day, that's about{' '}
                    <strong style={{ color: CATEGORY_COLORS.phone }}>
                      {Math.round((phoneHrs / 24) * 365)} days per year
                    </strong>{' '}
                    just on a screen.
                  </Hint>
                </div>
              </div>
            )}

            {/* Step 4: Daily Time Allocation + Custom Categories */}
            {step === 4 && (
              <div className="space-y-6 sm:space-y-10">
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-medium" style={{ color: 'var(--th-text)' }}>
                    Your typical day
                  </h1>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--th-text-muted)' }}>
                    Average hours per day for each activity.
                  </p>
                </div>

                <div className="space-y-5">
                  {(Object.keys(allocation) as Array<keyof typeof allocation>).map(
                    (key) => {
                      const val = Number(allocation[key]);
                      const remark = getComparison(key, val);
                      return (
                        <div key={key} className="space-y-1">
                          <TimeSlider
                            label={CATEGORY_LABELS[key] || key}
                            value={val}
                            min={0}
                            max={16}
                            step={0.5}
                            color={CATEGORY_COLORS[key]}
                            onChange={(v) => $timeAllocation.setKey(key, String(v))}
                          />
                          {remark && (
                            <motion.p
                              className="text-[10px] pl-1"
                              style={{ color: CATEGORY_COLORS[key] }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              key={`${key}-${val}`}
                            >
                              {remark}
                            </motion.p>
                          )}
                        </div>
                      );
                    }
                  )}

                  {/* Custom categories */}
                  {customCats.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <TimeSlider
                            label={`${cat.emoji} ${cat.label}`}
                            value={cat.hours}
                            min={0}
                            max={16}
                            step={0.5}
                            color={cat.color}
                            onChange={(v) => updateCustomCategoryHours(cat.id, v)}
                          />
                        </div>
                        <button
                          onClick={() => removeCustomCategory(cat.id)}
                          className="text-xs px-2 py-1 rounded transition-colors shrink-0"
                          style={{ color: 'var(--th-text-muted)' }}
                          title="Remove category"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Category button / form */}
                  {customCats.length < MAX_CUSTOM_CATEGORIES && (
                    <>
                      {!showCatForm ? (
                        <motion.button
                          onClick={() => setShowCatForm(true)}
                          className="w-full text-xs py-3 rounded-lg transition-colors"
                          style={{
                            color: 'var(--th-text-muted)',
                            border: '1px dashed var(--th-border)',
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          + Add Custom Category ({customCats.length}/{MAX_CUSTOM_CATEGORIES})
                        </motion.button>
                      ) : (
                        <motion.div
                          className="rounded-xl p-4 space-y-3"
                          style={{
                            backgroundColor: 'var(--th-surface)',
                            border: '1px solid var(--th-border)',
                          }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Emoji"
                              value={catEmoji}
                              onChange={(e) => setCatEmoji(e.target.value)}
                              className="w-14 rounded-lg px-2 py-2 text-center text-sm focus:outline-none"
                              style={{
                                backgroundColor: 'var(--th-bg)',
                                border: '1px solid var(--th-border)',
                                color: 'var(--th-text)',
                              }}
                              maxLength={4}
                            />
                            <input
                              type="text"
                              placeholder="Category name"
                              value={catName}
                              onChange={(e) => setCatName(e.target.value)}
                              className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                              style={{
                                backgroundColor: 'var(--th-bg)',
                                border: '1px solid var(--th-border)',
                                color: 'var(--th-text)',
                              }}
                              maxLength={20}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: 'var(--th-text-muted)' }}>
                              Color:
                            </span>
                            {CUSTOM_CATEGORY_PALETTE.map((c) => (
                              <button
                                key={c}
                                onClick={() => setCatColor(c)}
                                className="w-6 h-6 rounded-full transition-transform"
                                style={{
                                  backgroundColor: c,
                                  transform: catColor === c ? 'scale(1.3)' : 'scale(1)',
                                  border: catColor === c ? '2px solid var(--th-text)' : '2px solid transparent',
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={addCustomCategory}
                              disabled={!catName.trim() || !catEmoji.trim()}
                              className="text-xs px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30"
                              style={{
                                backgroundColor: 'var(--th-accent)',
                                color: 'var(--th-accent-inv)',
                              }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowCatForm(false)}
                              className="text-xs px-4 py-2 rounded-lg"
                              style={{ color: 'var(--th-text-muted)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </>
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
                  {totalAllocated > 24 && (
                    <p className="text-[10px] mt-2" style={{ color: '#e06c75' }}>
                      That's more than 24 hours — you may be double-counting some time.
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10 sm:mt-16">
          <button
            onClick={prev}
            className="px-4 sm:px-6 py-3 text-sm rounded-lg transition-colors"
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
            className="px-6 sm:px-8 py-3 text-sm rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--th-accent)',
              color: 'var(--th-accent-inv)',
            }}
          >
            {step < STEPS - 1 ? 'Continue' : 'See Your Life'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
