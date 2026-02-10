import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLS = 52;
const ROWS = 5;
const TOTAL = COLS * ROWS;
const FILLED_COUNT = Math.floor(TOTAL * 0.35);

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Responsive cell sizing: 4px on small phones → 6px on desktop
const CELL = 'clamp(4px, 1.15vw, 6px)';
const GAP = 'clamp(1px, 0.35vw, 2px)';

// Phases:
// 0: darkness
// 1: center square pulses into existence
// 2: grid cascades outward from center
// 3: first text word-by-word
// 4: grid fills (lived time) + legend
// 5: second text crossfades in
// 6: begin button materializes

/** Word-by-word text reveal with subtle blur-to-sharp */
function WordByWord({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(' ');
  return (
    <motion.p
      className={className}
      style={{
        ...style,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 0.3em',
      }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 6, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

interface Props {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: Props) {
  const [skipped, setSkipped] = useState(false);
  const [phase, setPhase] = useState(0);

  const skip = useCallback(() => {
    setSkipped(true);
    setPhase(6);
  }, []);

  // Skip on any keydown (except Tab for a11y)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      skip();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [skip]);

  // Auto-play timeline (~8s)
  useEffect(() => {
    if (skipped) return;
    const t = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 5200),
      setTimeout(() => setPhase(5), 6500),
      setTimeout(() => setPhase(6), 7800),
    ];
    return () => t.forEach(clearTimeout);
  }, [skipped]);

  const instant = { duration: 0 };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:p-6 select-none cursor-pointer relative overflow-hidden"
      onClick={skip}
    >
      {/* Cinematic vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, var(--th-bg) 100%)',
          opacity: 0.7,
        }}
      />

      <div
        className="flex flex-col items-center gap-8 sm:gap-10 w-full relative z-10"
        style={{ maxWidth: 440 }}
      >
        {/* Text — crossfade between lines */}
        <div className="min-h-[3.5rem] sm:min-h-[4.5rem] flex items-center justify-center w-full">
          {skipped ? (
            <p
              className="text-base sm:text-xl text-center leading-relaxed italic"
              style={{ color: 'var(--th-text)' }}
            >
              How will you spend yours?
            </p>
          ) : (
            <AnimatePresence mode="wait">
              {phase >= 3 && phase < 5 && (
                <motion.div
                  key="t1"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <WordByWord
                    text="The average human life is about 4,000 weeks."
                    className="text-base sm:text-xl text-center leading-relaxed tracking-tight"
                    style={{ color: 'var(--th-text)' }}
                  />
                </motion.div>
              )}
              {phase >= 5 && (
                <motion.div
                  key="t2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <WordByWord
                    text="How will you spend yours?"
                    className="text-base sm:text-xl text-center leading-relaxed italic"
                    style={{ color: 'var(--th-text)' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Mini life grid */}
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL})`,
            gap: GAP,
          }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const cCol = Math.floor(COLS / 2);
            const cRow = Math.floor(ROWS / 2);
            const isCenter = col === cCol && row === cRow;
            const dist = Math.abs(col - cCol) + Math.abs(row - cRow);

            const isFilled = phase >= 4 && i < FILLED_COUNT;
            const isCurrent = phase >= 4 && i === FILLED_COUNT;

            // Before cascade: only center square (or nothing)
            if (phase < 2 && !isCenter) {
              return <div key={i} style={{ aspectRatio: '1' }} />;
            }
            if (phase < 1) {
              return <div key={i} style={{ aspectRatio: '1' }} />;
            }

            // Phase 1: dramatic center square — heartbeat entrance
            if (phase === 1) {
              if (!isCenter) return <div key={i} style={{ aspectRatio: '1' }} />;
              return (
                <motion.div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 1,
                    backgroundColor: 'var(--th-current)',
                    boxShadow: '0 0 10px var(--th-current-shadow)',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0.4, 1],
                    scale: [0, 1.8, 0.7, 1],
                  }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              );
            }

            // Determine square appearance
            let bg: string;
            let op: number;
            if (isCurrent) {
              bg = 'var(--th-current)';
              op = 1;
            } else if (isFilled) {
              bg = 'var(--th-text)';
              op = 0.55;
            } else {
              bg = 'var(--th-border)';
              op = 0.35;
            }

            // Sweep delay for the fill animation (row-by-row, left-to-right)
            const fillDelay =
              phase >= 4 && !skipped ? `${i * 0.003}s` : '0s';

            return (
              <motion.div
                key={i}
                style={{
                  aspectRatio: '1',
                  borderRadius: 1,
                  backgroundColor: bg,
                  transition: `background-color 0.4s ease ${fillDelay}`,
                  ...(isCurrent
                    ? {
                        animation: 'pulse-glow 2s ease-in-out infinite',
                        boxShadow: '0 0 6px var(--th-current-shadow)',
                      }
                    : {}),
                }}
                initial={skipped ? { opacity: op } : { opacity: 0, scale: 0 }}
                animate={{ opacity: op, scale: 1 }}
                transition={
                  skipped
                    ? instant
                    : {
                        duration: 0.35,
                        delay: dist * 0.012,
                        ease: EASE,
                      }
                }
              />
            );
          })}
        </div>

        {/* Legend */}
        {phase >= 4 && (
          <motion.div
            className="flex items-center gap-4"
            initial={skipped ? { opacity: 0.5 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={
              skipped ? instant : { duration: 0.5, delay: 0.3, ease: EASE }
            }
          >
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: 'var(--th-text)',
                  opacity: 0.55,
                }}
              />
              <span
                className="text-[10px]"
                style={{ color: 'var(--th-text-muted)' }}
              >
                lived
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: 'var(--th-current)',
                  boxShadow: '0 0 4px var(--th-current-shadow)',
                }}
              />
              <span
                className="text-[10px]"
                style={{ color: 'var(--th-text-muted)' }}
              >
                now
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: 'var(--th-border)',
                  opacity: 0.35,
                }}
              />
              <span
                className="text-[10px]"
                style={{ color: 'var(--th-text-muted)' }}
              >
                remaining
              </span>
            </div>
          </motion.div>
        )}

        {/* Begin button */}
        <div className="h-16 flex items-center justify-center">
          {phase >= 6 && (
            <motion.button
              className="px-10 py-3.5 text-sm rounded-lg font-medium tracking-wide"
              style={{
                backgroundColor: 'var(--th-accent)',
                color: 'var(--th-accent-inv)',
              }}
              initial={skipped ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                skipped ? instant : { duration: 0.6, ease: EASE }
              }
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              Begin
            </motion.button>
          )}
        </div>
      </div>

      {/* Skip hint */}
      {!skipped && phase >= 2 && phase < 5 && (
        <motion.p
          className="absolute bottom-6 text-[10px]"
          style={{ color: 'var(--th-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          tap anywhere to skip
        </motion.p>
      )}
    </div>
  );
}
