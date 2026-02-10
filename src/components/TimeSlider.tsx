interface TimeSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  color?: string;
  onChange: (value: number) => void;
}

export default function TimeSlider({
  label,
  value,
  min = 0,
  max = 12,
  step = 0.5,
  unit = 'hrs/day',
  color,
  onChange,
}: TimeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const trackColor = color || 'var(--th-text)';

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs" style={{ color: 'var(--th-text-muted)' }}>
          {label}
        </span>
        <span className="text-xs font-medium tabular-nums" style={{ color: trackColor }}>
          {value} {unit}
        </span>
      </div>
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full appearance-none h-2 sm:h-1.5 rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${trackColor} ${percentage}%, var(--th-border) ${percentage}%)`,
          }}
        />
      </div>
    </div>
  );
}
