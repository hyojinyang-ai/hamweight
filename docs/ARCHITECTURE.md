# MyWieght Architecture

## System Overview

MyWieght is a client-only PWA — no backend, no API calls. All data persists in the browser's localStorage through Zustand's `persist` middleware.

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────┐    ┌──────────┐               │
│  │ Next.js  │───▶│ Zustand  │──▶ localStorage│
│  │ App      │◀───│ Store    │◀──            │
│  │ Router   │    └──────────┘               │
│  └──────────┘                                │
│       │                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Tailwind │  │ Framer   │  │ Recharts │  │
│  │ CSS      │  │ Motion   │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## Data Model

### UserProfile
```typescript
{
  height: number;      // always stored in cm
  unit: 'metric' | 'imperial';
  language: 'en' | 'ko';
  createdAt: string;   // ISO date
}
```

### WeightEntry
```typescript
{
  id: string;          // UUID v4
  weight: number;      // always stored in kg
  timestamp: string;   // ISO datetime
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'evening';
  exerciseContext: 'before' | 'after' | 'none';
  measurements?: {     // optional body measurements (cm)
    waist, hips, chest, arms, thighs
  };
}
```

### Goal
```typescript
{
  type: 'lose' | 'gain' | 'maintain';
  targetWeight: number;  // kg
  deadline?: string;     // ISO date
  startWeight: number;   // kg
  startDate: string;     // ISO date
}
```

## Page Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `page.tsx` | Dashboard with weight card, stats, heatmap, goal ring |
| `/history` | `history/page.tsx` | Trend chart + scrollable entry list |
| `/goals` | `goals/page.tsx` | Goal creation, progress tracking |
| `/settings` | `settings/page.tsx` | Language, theme, units, height, notifications, data export |

## Component Hierarchy

```
RootLayout
├── ThemeProvider (next-themes)
│   ├── <main> (current page)
│   │   ├── Home
│   │   │   ├── WeightCard → WeightSheet (bottom sheet)
│   │   │   ├── StatsRow (streak, weekly change, BMI)
│   │   │   ├── ActivityHeatmap → Calendar modal (bottom sheet)
│   │   │   └── GoalProgressRing
│   │   ├── History
│   │   │   ├── TrendChart
│   │   │   └── Entry list
│   │   ├── Goals
│   │   │   ├── Goal progress card
│   │   │   └── Create goal dialog
│   │   └── Settings
│   │       ├── Language card
│   │       ├── Appearance card
│   │       ├── Units & Height card
│   │       ├── Reminders card
│   │       └── Data export card
│   └── BottomNav (fixed)
└── OnboardingFlow (shown if !onboardingComplete)
    ├── Step 1: Welcome
    ├── Step 2: Language + Units + Height
    └── Step 3: First weight entry
```

## Internationalization (i18n)

Simple client-side approach — no routing-based i18n.

- `lib/i18n.ts` exports `getTranslations(locale)` returning a typed object
- Language stored in `UserProfile.language`
- Default: `"en"` (falls back when profile is null)
- Components read `profile?.language ?? "en"` from Zustand
- Dynamic strings use functions: `t.lastDays(7)` → `"Last 7 Days"` / `"최근 7일"`

## Streak Calculation

Computed in `store.addEntry()`:
1. Compare today vs `lastLogDate`
2. Same day → streak unchanged
3. Consecutive day (diff = 1) → streak + 1
4. Gap (diff > 1) → streak resets to 1
5. First entry → streak = 1

Milestone celebrations at: 3, 7, 14, 30, 100 days

## Theming

Dual theme support via `next-themes`:
- Light: Warm cream background, white cards, black borders/shadows
- Dark: Deep warm background, dark cards, warm-light borders/shadows

Neo-brutalism CSS variables adapt per theme in `globals.css`.
