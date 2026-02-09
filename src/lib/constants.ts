export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;

export const DEFAULT_LIFE_EXPECTANCY = 73;
export const DEFAULT_RETIREMENT_AGE = 65;

// Split parent defaults
export const DEFAULT_MOTHER_AGE = 55;
export const DEFAULT_FATHER_AGE = 55;
export const DEFAULT_MOTHER_LIFE_EXPECTANCY = 80;
export const DEFAULT_FATHER_LIFE_EXPECTANCY = 80;
export const DEFAULT_MOTHER_VISITS_PER_YEAR = 10;
export const DEFAULT_FATHER_VISITS_PER_YEAR = 10;
export const DEFAULT_MOTHER_ALIVE = 'true';
export const DEFAULT_FATHER_ALIVE = 'true';
export const DEFAULT_PHONE_HOURS_PER_DAY = 4;

// Legacy defaults (for migration)
export const DEFAULT_PARENTS_AGE = 55;
export const DEFAULT_PARENTS_LIFE_EXPECTANCY = 80;
export const DEFAULT_PARENT_VISITS_PER_YEAR = 10;
export const DEFAULT_PARENTS_ALIVE = 'both';
export const DEFAULT_PARENTS_LIVE_TOGETHER = 'true';

export const DEFAULT_TIME_ALLOCATION = {
  sleep: 8,
  work: 8,
  family: 1,
  partner: 2,
  hobbies: 2,
  health: 1,
  chores: 2,
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  sleep: '#8b7355',
  work: '#6b8f71',
  family: '#7b6d8e',
  partner: '#8f6b6b',
  hobbies: '#6b7e8f',
  health: '#8f8b6b',
  chores: '#7a7a7a',
  phone: '#e06c75',
  parents: '#9b8579',
  free: '#525252',
};

export const CATEGORY_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  work: 'Work',
  family: 'Family',
  partner: 'Partner',
  hobbies: 'Hobbies',
  health: 'Health & Exercise',
  chores: 'Chores & Errands',
  phone: 'Phone / Screen Time',
  parents: 'Time with Parents',
  free: 'Free Time',
};

export const CATEGORY_EMOJI: Record<string, string> = {
  sleep: '\u{1F634}',
  work: '\u{1F4BC}',
  family: '\u{1F46A}',
  partner: '\u{2764}\u{FE0F}',
  hobbies: '\u{1F3A8}',
  health: '\u{1F3CB}\u{FE0F}',
  chores: '\u{1F9F9}',
  phone: '\u{1F4F1}',
  parents: '\u{1F9D3}',
  free: '\u{2728}',
};

// Custom categories
export const MAX_CUSTOM_CATEGORIES = 3;

export const CUSTOM_CATEGORY_PALETTE = [
  '#c2855a', // warm amber
  '#6ba39b', // teal
  '#a36b9b', // mauve
  '#8fa36b', // olive green
  '#6b8fa3', // steel blue
  '#a3836b', // clay
];

export interface CustomCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  hours: number;
}

// Helper functions that check custom categories first, then built-in maps
let _customCategories: CustomCategory[] = [];
export function setCustomCategoriesRef(cats: CustomCategory[]) {
  _customCategories = cats;
}

export function getCategoryLabel(key: string): string {
  const custom = _customCategories.find((c) => c.id === key);
  if (custom) return custom.label;
  return CATEGORY_LABELS[key] || key;
}

export function getCategoryColor(key: string): string {
  const custom = _customCategories.find((c) => c.id === key);
  if (custom) return custom.color;
  return CATEGORY_COLORS[key] || '#525252';
}

export function getCategoryEmoji(key: string): string {
  const custom = _customCategories.find((c) => c.id === key);
  if (custom) return custom.emoji;
  return CATEGORY_EMOJI[key] || '';
}

export const PHASE_COLORS: Record<string, { dark: string; light: string }> = {
  childhood: {
    dark: 'rgba(139, 115, 85, 0.06)',
    light: 'rgba(139, 115, 85, 0.08)',
  },
  education: {
    dark: 'rgba(107, 143, 113, 0.06)',
    light: 'rgba(107, 143, 113, 0.08)',
  },
  career: {
    dark: 'rgba(123, 109, 142, 0.06)',
    light: 'rgba(123, 109, 142, 0.08)',
  },
  retirement: {
    dark: 'rgba(143, 107, 107, 0.06)',
    light: 'rgba(143, 107, 107, 0.08)',
  },
};

export type ViewMode = 'weeks' | 'months' | 'years';
