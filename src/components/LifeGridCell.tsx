import { memo, useState } from 'react';
import type { WeekData, MonthData, YearData } from '../lib/calculations';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

interface WeekCellProps {
  week: WeekData;
  highlighted: string | null;
  currentWeekIndex: number;
  highlightedCategoryWeeks: number;
  highlightedColor?: string;
}

function WeekCell({ week, highlighted, currentWeekIndex, highlightedCategoryWeeks, highlightedColor }: WeekCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const futureOffset = week.status === 'future' ? week.index - currentWeekIndex : -1;
  const isInCategory = highlighted != null && futureOffset >= 0 && futureOffset < highlightedCategoryWeeks;

  const cellStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '1px',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
  };

  if (week.status === 'lived') {
    cellStyle.backgroundColor = 'var(--th-lived)';
    if (highlighted) cellStyle.opacity = 0.3;
  } else if (week.status === 'current') {
    cellStyle.backgroundColor = 'var(--th-current)';
    cellStyle.animation = 'pulse-glow 2s ease-in-out infinite';
    cellStyle.boxShadow = '0 0 4px var(--th-current-shadow)';
  } else {
    if (highlighted && isInCategory) {
      cellStyle.backgroundColor = highlightedColor;
      cellStyle.opacity = 0.85;
    } else if (highlighted) {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
      cellStyle.opacity = 0.2;
    } else {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={cellStyle} />
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div
            className="rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: 'var(--th-surface)',
              border: '1px solid var(--th-border)',
            }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>
              Age {week.year}, Week {week.weekOfYear + 1}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
              {formatDate(week.startDate)} · {week.phase}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MonthCellProps {
  month: MonthData;
  highlighted: string | null;
  highlightedCategoryMonths: number;
  currentMonthIndex: number;
  highlightedColor?: string;
}

function MonthCellInner({ month, highlighted, highlightedCategoryMonths, currentMonthIndex, highlightedColor }: MonthCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const futureOffset = month.status === 'future' ? month.index - currentMonthIndex : -1;
  const isInCategory = highlighted != null && futureOffset >= 0 && futureOffset < highlightedCategoryMonths;

  const cellStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '2px',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
  };

  if (month.status === 'lived') {
    cellStyle.backgroundColor = 'var(--th-lived)';
    if (highlighted) cellStyle.opacity = 0.3;
  } else if (month.status === 'current') {
    cellStyle.backgroundColor = 'var(--th-current)';
    cellStyle.animation = 'pulse-glow 2s ease-in-out infinite';
    cellStyle.boxShadow = '0 0 6px var(--th-current-shadow)';
  } else {
    if (highlighted && isInCategory) {
      cellStyle.backgroundColor = highlightedColor;
      cellStyle.opacity = 0.85;
    } else if (highlighted) {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
      cellStyle.opacity = 0.2;
    } else {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={cellStyle} />
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div
            className="rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: 'var(--th-surface)',
              border: '1px solid var(--th-border)',
            }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>
              Age {month.year}, {monthNames[month.monthOfYear]}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
              {month.phase}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface YearCellProps {
  year: YearData;
  highlighted: string | null;
  highlightedCategoryYears: number;
  currentYearIndex: number;
  highlightedColor?: string;
}

function YearCellInner({ year, highlighted, highlightedCategoryYears, currentYearIndex, highlightedColor }: YearCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const futureOffset = year.status === 'future' ? year.index - currentYearIndex : -1;
  const isInCategory = highlighted != null && futureOffset >= 0 && futureOffset < highlightedCategoryYears;

  const cellStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '3px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
  };

  if (year.status === 'lived') {
    cellStyle.backgroundColor = 'var(--th-lived)';
    if (highlighted) cellStyle.opacity = 0.3;
  } else if (year.status === 'current') {
    cellStyle.backgroundColor = 'var(--th-future)';
    cellStyle.border = '1px solid var(--th-border)';
  } else {
    if (highlighted && isInCategory) {
      cellStyle.backgroundColor = highlightedColor;
      cellStyle.opacity = 0.85;
    } else if (highlighted) {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
      cellStyle.opacity = 0.2;
    } else {
      cellStyle.backgroundColor = 'var(--th-future)';
      cellStyle.border = '0.5px solid var(--th-border)';
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={cellStyle}>
        {year.status === 'current' && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${year.percentLived}%`,
              backgroundColor: 'var(--th-current)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}
      </div>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
          <div
            className="rounded-lg px-3 py-2 whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: 'var(--th-surface)',
              border: '1px solid var(--th-border)',
            }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--th-text)' }}>
              Age {year.index}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--th-text-muted)' }}>
              {year.phase}{year.status === 'current' ? ` · ${year.percentLived.toFixed(0)}% complete` : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const MemoWeekCell = memo(WeekCell);
export const MemoMonthCell = memo(MonthCellInner);
export const MemoYearCell = memo(YearCellInner);
