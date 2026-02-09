import { memo, useState } from 'react';
import type { WeekData } from '../lib/calculations';
import { PHASE_COLORS } from '../lib/constants';

interface LifeGridCellProps {
  week: WeekData;
}

function LifeGridCell({ week }: LifeGridCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const cellStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '1px',
  };

  if (week.status === 'lived') {
    cellStyle.backgroundColor = '#404040';
  } else if (week.status === 'current') {
    cellStyle.backgroundColor = '#e5e5e5';
    cellStyle.animation = 'pulse-glow 2s ease-in-out infinite';
    cellStyle.boxShadow = '0 0 4px rgba(229, 229, 229, 0.4)';
  } else {
    cellStyle.backgroundColor = '#1a1a1a';
    cellStyle.border = '0.5px solid #262626';
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={cellStyle} />
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-surface border border-future-border rounded-md px-3 py-2 whitespace-nowrap shadow-lg">
            <div className="text-xs font-medium text-text-primary">
              Age {week.year}, Week {week.weekOfYear + 1}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">
              {formatDate(week.startDate)} · {week.phase}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LifeGridCell);
