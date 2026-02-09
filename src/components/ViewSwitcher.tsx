import { useStore } from '@nanostores/react';
import { $viewMode } from '../stores/life';
import type { ViewMode } from '../lib/constants';

const modes: { value: ViewMode; label: string }[] = [
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export default function ViewSwitcher() {
  const viewMode = useStore($viewMode) as ViewMode;

  return (
    <div
      className="inline-flex rounded-lg p-1 gap-1"
      style={{ backgroundColor: 'var(--th-surface)', border: '1px solid var(--th-border)' }}
    >
      {modes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => $viewMode.set(value)}
          className="px-4 py-1.5 text-xs rounded-md transition-all duration-200 font-medium"
          style={{
            backgroundColor: viewMode === value ? 'var(--th-accent)' : 'transparent',
            color: viewMode === value ? 'var(--th-accent-inv)' : 'var(--th-text-muted)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
