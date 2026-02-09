import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $lifeConfig, $lifeStats } from '../stores/life';

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export default function ShareToast() {
  const [show, setShow] = useState(false);
  const rawConfig = useStore($lifeConfig);
  const stats = useStore($lifeStats);

  useEffect(() => {
    const last = localStorage.getItem('share-dismissed-at');
    if (last && Date.now() - Number(last) < COOLDOWN_MS) return;

    const timer = setTimeout(() => setShow(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('share-dismissed-at', String(Date.now()));
  };

  const handleShare = useCallback(() => {
    const url = window.location.origin;
    const text = `I just visualized my entire life in weeks. ${stats ? `${stats.weeksRemaining.toLocaleString()} weeks remaining.` : ''} Try it yourself:`;

    if (navigator.share) {
      navigator.share({ title: 'Memento Vita', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        alert('Link copied to clipboard!');
      });
    }
    dismiss();
  }, [stats]);

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
              <span className="text-2xl shrink-0 mt-0.5">🎨</span>
              <div className="space-y-2.5">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--th-text)' }}>
                  Want a keepsake? Download your life as a poster, or share it with a friend.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      dismiss();
                      // Scroll to top and click the export button
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => {
                        const btn = document.querySelector('[data-export-poster]') as HTMLButtonElement;
                        btn?.click();
                      }, 400);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--th-accent)',
                      color: 'var(--th-accent-inv)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                    style={{
                      color: 'var(--th-text)',
                      border: '1px solid var(--th-border)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Share
                  </button>
                  <button
                    onClick={dismiss}
                    className="text-[10px] transition-colors ml-1"
                    style={{ color: 'var(--th-text-muted)' }}
                  >
                    Later
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
