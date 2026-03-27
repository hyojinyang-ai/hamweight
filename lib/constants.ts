export const TIME_RANGES = {
  morning: { start: 5, end: 11 },    // 5:00 AM - 11:59 AM
  lunch: { start: 12, end: 13 },     // 12:00 PM - 1:59 PM
  afternoon: { start: 14, end: 17 }, // 2:00 PM - 5:59 PM
  evening: { start: 18, end: 4 },    // 6:00 PM - 4:59 AM
} as const;

export const BMI_CATEGORIES = {
  underweight: { max: 18.5, label: 'Underweight', color: 'warning' },
  normal: { max: 24.9, label: 'Normal', color: 'success' },
  overweight: { max: 29.9, label: 'Overweight', color: 'warning' },
  obese: { max: Infinity, label: 'Obese', color: 'destructive' },
} as const;

export const STREAK_MILESTONES = [3, 7, 14, 30, 100] as const;

export const NOTIFICATION_MESSAGES = [
  "🐹 Time to weigh in! Your hamster is waiting...",
  "🐹 Good morning! Let's check your progress today",
  "🐹 Don't break your streak! Quick weigh-in?",
] as const;

export const HAMSTER_SIZES = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 160,
} as const;
