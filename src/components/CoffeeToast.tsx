import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $activeToast } from '../stores/toast';

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export default function CoffeeToast() {
  const [show, setShow] = useState(false);
  const activeToast = useStore($activeToast);

  useEffect(() => {
    const last = localStorage.getItem('coffee-dismissed-at');
    if (last && Date.now() - Number(last) < COOLDOWN_MS) return;

    let retryTimer: ReturnType<typeof setInterval>;

    const tryShow = () => {
      if ($activeToast.get() === null) {
        setShow(true);
        $activeToast.set('coffee');
        if (retryTimer) clearInterval(retryTimer);
      }
    };

    const timer = setTimeout(() => {
      if ($activeToast.get() === null) {
        tryShow();
      } else {
        retryTimer = setInterval(tryShow, 5000);
      }
    }, 45000);

    return () => {
      clearTimeout(timer);
      if (retryTimer) clearInterval(retryTimer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    $activeToast.set(null);
    localStorage.setItem('coffee-dismissed-at', String(Date.now()));
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-xs mx-auto sm:mx-0"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="rounded-2xl p-5 shadow-lg"
            style={{
              backgroundColor: 'var(--th-surface)',
              border: '1px solid var(--th-border)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">☕</span>
              <div className="space-y-2.5">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text)' }}>
                  Glad you're finding this useful! If it made you think,
                  consider buying me a tiny cup of coffee — it'd make my day.
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://buymeacoffee.com/rumiallbert"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--th-accent)',
                      color: 'var(--th-accent-inv)',
                    }}
                  >
                    Buy me a coffee
                  </a>
                  <button
                    onClick={dismiss}
                    className="text-[10px] transition-colors"
                    style={{ color: 'var(--th-text-muted)' }}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
