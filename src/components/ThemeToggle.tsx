import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $theme } from '../stores/life';

const themes = [
  { id: 'dark', label: 'Dark', swatch: '#0a0a0a', border: '#262626' },
  { id: 'light', label: 'Light', swatch: '#f8f8f8', border: '#e5e5e5' },
  { id: 'midnight', label: 'Midnight', swatch: '#0e0b1a', border: '#2a2445' },
  { id: 'ocean', label: 'Ocean', swatch: '#0f1318', border: '#2a3240' },
  { id: 'forest', label: 'Forest', swatch: '#101210', border: '#2a332b' },
  { id: 'rose', label: 'Rose', swatch: '#121012', border: '#302a30' },
];

export default function ThemeToggle() {
  const theme = useStore($theme);
  const [open, setOpen] = useState(false);

  const apply = (id: string) => {
    $theme.set(id);
    document.documentElement.className = id;
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs"
        style={{
          border: '1px solid var(--th-border)',
          color: 'var(--th-text-muted)',
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: themes.find((t) => t.id === theme)?.swatch,
            border: `1px solid ${themes.find((t) => t.id === theme)?.border}`,
          }}
        />
        Theme
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 rounded-xl p-3 shadow-lg min-w-[160px]"
              style={{
                backgroundColor: 'var(--th-surface)',
                border: '1px solid var(--th-border)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => apply(t.id)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme === t.id ? 'var(--th-border)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{
                        backgroundColor: t.swatch,
                        border: `2px solid ${t.border}`,
                        boxShadow: theme === t.id ? '0 0 0 2px var(--th-accent)' : 'none',
                      }}
                    />
                    <span
                      className="text-[9px]"
                      style={{ color: theme === t.id ? 'var(--th-text)' : 'var(--th-text-muted)' }}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
