# MyWieght — Project Guide

## What This Is
A mobile-first weight tracking PWA. Simple daily logging with streak tracking, goal progress, activity heatmap, and calendar view. No backend — all data in localStorage via Zustand.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **Components:** shadcn/ui (heavily customized for neo-brutalism)
- **State:** Zustand with `persist` middleware (localStorage)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React (no emojis — all icons are Lucide components)
- **i18n:** Custom `lib/i18n.ts` with English/Korean translations
- **Font:** Outfit (Google Fonts)

## Design System: Neo-Brutalism
- **Borders:** `2.5px solid` black (light) / warm-light (dark) via `--neo-border` CSS var
- **Shadows:** Hard offset `4px 4px 0px` black, no blur via `--neo-shadow` CSS vars
- **Colors:** Warm cream background, coral primary (`hsl(6, 78%, 66%)`), yellow secondary, mint accent
- **Typography:** `font-black` for headings/numbers, `font-bold` for labels, Outfit font
- **Buttons:** Press effect with `active:translate` that flattens the shadow
- **Cards:** White bg + thick border + hard shadow
- **No gradients** — flat colors only

## Architecture

```
app/
├── layout.tsx          # Root layout, Outfit font, ThemeProvider, BottomNav
├── page.tsx            # Dashboard: WeightCard, StatsRow, ActivityHeatmap, GoalProgressRing
├── history/page.tsx    # Trend chart + entry list with time/exercise icons
├── goals/page.tsx      # Goal CRUD with progress bar
└── settings/page.tsx   # Language, appearance, units, notifications, data export

components/
├── ui/                 # shadcn/ui primitives (card, button, input, select, dialog, sheet, switch, label)
├── dashboard/
│   ├── StatsRow.tsx         # 3-col grid: streak, weekly change, BMI
│   ├── GoalProgressRing.tsx # SVG ring + progress info
│   └── ActivityHeatmap.tsx  # GitHub-style heatmap + calendar detail modal
├── weight/
│   ├── WeightCard.tsx       # Main CTA card on dashboard
│   └── WeightSheet.tsx      # Bottom sheet for logging weight
├── charts/
│   └── TrendChart.tsx       # Recharts line chart
├── celebration/
│   └── StreakCelebration.tsx # Milestone celebration overlay
├── layout/
│   └── BottomNav.tsx        # Fixed bottom navigation
├── onboarding/
│   └── OnboardingFlow.tsx   # 3-step onboarding (welcome → setup → first weight)
└── theme-provider.tsx       # next-themes wrapper

lib/
├── store.ts     # Zustand store (profile, entries, goal, streak, notifications)
├── types.ts     # TypeScript interfaces (WeightEntry, UserProfile, Goal, etc.)
├── constants.ts # Time ranges, BMI categories, streak milestones, sizes
├── utils.ts     # formatWeight, calculateBMI, unit conversions, date helpers
└── i18n.ts      # English/Korean translation strings
```

## Key Patterns

### i18n
- Translations live in `lib/i18n.ts` as a `translations` object with `en` and `ko` keys
- Language stored in `UserProfile.language` field in Zustand
- Access via `getTranslations(lang)` → returns typed translation object
- All user-facing strings must use translation keys, not hardcoded English

### State Management
- Single Zustand store in `lib/store.ts` with `persist` middleware
- Storage key: `hamweight-storage`
- Streak auto-calculated on `addEntry()` based on consecutive days
- All weights stored in kg internally; display converted via `formatWeight()`

### Neo-Brutalism CSS Variables
Defined in `globals.css`:
```css
--neo-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
--neo-shadow-sm: 3px 3px 0px 0px rgba(0,0,0,1);
--neo-shadow-lg: 6px 6px 0px 0px rgba(0,0,0,1);
--neo-border: 2.5px solid hsl(0 0% 7%);
```
Usage: `[border:var(--neo-border)] [box-shadow:var(--neo-shadow)]`

### Icons (No Emojis)
All icons use Lucide React components. Time-of-day: Sunrise, Sun, CloudSun, Moon. Exercise: BedDouble, Dumbbell, PersonStanding. Navigation uses Home, History, Target, Settings.

## Conventions
- Pages use `"use client"` directive (client-side state)
- All pages follow consistent layout: `mx-auto max-w-md space-y-4 px-4 py-6`
- Page headers: `text-2xl font-black tracking-tight` with subtitle `text-sm font-bold text-foreground/50`
- Settings cards each have a distinct tinted background color
- The mascot character was removed — no character images in the app
- Bottom nav has 20px padding at bottom of `<main>` (`pb-20`)
