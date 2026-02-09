// Real-world averages used for contextual feedback in onboarding.
// Sources: WHO, CDC, BLS, Pew Research, eMarketer, ATUS (2023-2024 data)

export const AVERAGES = {
  // Life expectancy — WHO World Health Statistics 2024
  lifeExpectancy: {
    global: 73.3,
    us: 77.5,
    japan: 84.3,
    uk: 81.8,
    label: 'Global average life expectancy is 73 years (WHO 2024).',
  },

  // Retirement — OECD / US Census
  retirementAge: {
    us: 64,
    global: 63,
    label: 'Average US retirement age is 64 (Census Bureau).',
  },

  // Sleep — CDC, American Academy of Sleep Medicine
  sleep: {
    average: 6.8,
    recommended: 8,
    label: 'Americans average 6.8 hrs/night — CDC recommends 7-9.',
  },

  // Work — Bureau of Labor Statistics (ATUS)
  work: {
    average: 8.5,
    label: 'Full-time US workers average 8.5 hrs/day (BLS).',
  },

  // Family time — BLS American Time Use Survey
  family: {
    average: 0.55,
    label: 'Average American spends ~33 min/day with family (ATUS).',
  },

  // Partner — ATUS
  partner: {
    average: 2.5,
    label: 'Couples average about 2-3 hrs/day of quality time (ATUS).',
  },

  // Hobbies / leisure — BLS ATUS
  hobbies: {
    average: 1.2,
    label: 'Average adult spends ~1.2 hrs/day on hobbies (ATUS).',
  },

  // Exercise — CDC NHIS
  health: {
    average: 0.3, // ~20 min/day
    recommended: 0.5, // 30 min/day per WHO
    label: 'Only 28% of Americans meet exercise guidelines (CDC). Average is ~20 min/day.',
  },

  // Chores — BLS ATUS
  chores: {
    average: 2.1,
    label: 'Americans average ~2.1 hrs/day on household tasks (ATUS).',
  },

  // Screen time — eMarketer / DataReportal
  phone: {
    average: 4.5,
    label: 'Average American spends 4.5 hrs/day on their phone (eMarketer 2024).',
  },

  // Parent visits — Pew Research / various surveys
  parentVisits: {
    average: 2,
    livingNearby: 10,
    label: 'The average adult sees their parents about 2× per year after moving out (Pew).',
  },

  // Parents life expectancy
  parentsLifeExpectancy: {
    average: 80,
    label: 'Average life expectancy for someone currently 55+ is about 80-85 (CDC).',
  },
} as const;

// Generate a friendly comparison remark
export function getComparison(
  category: string,
  value: number
): string | null {
  switch (category) {
    case 'lifeExpectancy': {
      if (value >= 85) return "Optimistic! Only ~15% of people reach 85+.";
      if (value >= 80) return "Above the global average — healthy ambition.";
      if (value >= 73) return "Right around the global average.";
      return "Below average — but every week counts.";
    }
    case 'retirementAge': {
      if (value <= 50) return "Early retirement! The FIRE movement would be proud.";
      if (value <= 55) return "Well ahead of average — nice planning.";
      if (value >= 70) return "Working longer than 90% of people — by choice?";
      if (value >= 65) return "Right around the US average of 64.";
      return null;
    }
    case 'sleep': {
      if (value >= 9) return "You're in the top 10% of sleepers. Rest well.";
      if (value >= 8) return "Meeting the CDC recommendation — good for you.";
      if (value >= 7) return "Slightly above the US average of 6.8 hrs.";
      if (value < 6) return "Less than 6 hrs — only 30% of adults do this.";
      return "Close to the national average of 6.8 hrs.";
    }
    case 'work': {
      if (value >= 12) return "That's intense — top 5% of working hours.";
      if (value >= 10) return "Above average — you put in serious hours.";
      if (value <= 4) return "Part-time or freelance? Nice flexibility.";
      if (value === 0) return "Not working? Lucky you!";
      return "Right around the full-time average of 8.5 hrs.";
    }
    case 'family': {
      if (value >= 3) return "That's 5× the national average — wonderful!";
      if (value >= 2) return "More than 3× average family time.";
      if (value >= 1) return "Nearly double the US average of 33 min/day.";
      if (value < 0.5) return "Below average — the typical American spends ~33 min.";
      return null;
    }
    case 'partner': {
      if (value >= 4) return "Lots of quality time together — relationship goals.";
      if (value >= 2) return "Right around what most couples manage.";
      if (value < 1) return "Less than an hour — busy schedules are real.";
      return null;
    }
    case 'hobbies': {
      if (value >= 4) return "That's 3× the average — passion-driven life!";
      if (value >= 2) return "More than most — good for the soul.";
      if (value < 1) return "Below average of 1.2 hrs — wish you had more?";
      return null;
    }
    case 'health': {
      if (value >= 2) return "Elite! You exercise 4× more than average.";
      if (value >= 1) return "Double the WHO recommendation — impressive.";
      if (value >= 0.5) return "Meeting WHO guidelines of 30 min/day.";
      if (value < 0.3) return "Below the 20 min/day average — small steps help.";
      return null;
    }
    case 'chores': {
      if (value >= 4) return "Double the national average — very tidy.";
      if (value >= 2) return "Right around the US average of 2.1 hrs.";
      if (value < 1) return "Below average — outsourcing or minimalist?";
      return null;
    }
    case 'phone': {
      if (value >= 8) return "That's nearly all your waking free time on a screen.";
      if (value >= 6) return "33% above the 4.5 hr average — that adds up.";
      if (value >= 4) return "Right around the national average of 4.5 hrs.";
      if (value <= 2) return "Way below average — impressive digital discipline!";
      if (value <= 1) return "Digital minimalist! Less than 25% of the average.";
      return "Slightly below the 4.5 hr average — not bad.";
    }
    case 'parentVisits': {
      if (value >= 20) return "That's 10× the average! Your parents are lucky.";
      if (value >= 10) return "5× the national average — they must love that.";
      if (value >= 4) return "Double what most adults manage after moving out.";
      if (value <= 1) return "The average is ~2×/year — every visit matters.";
      return "Close to the average of about 2× per year.";
    }
    default:
      return null;
  }
}
