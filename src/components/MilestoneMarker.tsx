import { WEEKS_PER_YEAR } from '../lib/constants';

interface MilestoneMarkerProps {
  weekIndex: number;
  label: string;
}

export default function MilestoneMarker({ weekIndex, label }: MilestoneMarkerProps) {
  const year = Math.floor(weekIndex / WEEKS_PER_YEAR);
  const week = weekIndex % WEEKS_PER_YEAR;

  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        gridRow: year + 1,
        gridColumn: week + 1,
      }}
    >
      <div className="w-2 h-2 rounded-full bg-accent border border-bg" />
    </div>
  );
}
