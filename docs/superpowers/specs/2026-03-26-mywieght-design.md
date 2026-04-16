# MyWieght Design Specification

A weight tracking web app with a cute hamster mascot for people who hate hassle.

## Overview

**Name:** MyWieght
**Target Users:** People who want simple weight tracking without friction
**Core Philosophy:** Dead simple — log weight in seconds, smart defaults handle the rest

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + CSS variables for theming |
| Components | shadcn/ui (customized with Rosy Peach palette) |
| State | Zustand + localStorage persistence |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

## Architecture

```
mywieght/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout + theme provider
│   ├── page.tsx             # Home/Dashboard
│   ├── history/page.tsx     # Weight history list
│   ├── goals/page.tsx       # Goal setting & progress
│   └── settings/page.tsx    # Units, notifications, theme
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── hamster/             # Hamster SVG + animations
│   │   ├── Hamster.tsx      # Main component
│   │   └── expressions/     # 13 expression variants
│   ├── weight/              # Weight input components
│   ├── charts/              # Recharts wrappers
│   └── layout/              # Navigation, headers
├── lib/
│   ├── store.ts             # Zustand store
│   ├── storage.ts           # localStorage helpers
│   └── utils.ts             # BMI calc, unit conversion
└── hooks/                   # Custom React hooks
```

## Data Model

### Weight Entry
```typescript
interface WeightEntry {
  id: string;                    // uuid
  weight: number;                // always stored in kg internally
  timestamp: Date;
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'evening';
  exerciseContext: 'before' | 'after' | 'none';
}
```

### User Profile
```typescript
interface UserProfile {
  height: number;                // always stored in cm internally
  unit: 'metric' | 'imperial';
  createdAt: Date;
}
```

### Goal
```typescript
interface Goal {
  type: 'lose' | 'gain' | 'maintain';
  targetWeight: number;          // kg
  deadline?: Date;               // optional
  startWeight: number;           // kg at goal creation
  startDate: Date;
}
```

### Notification Settings
```typescript
interface NotificationSettings {
  enabled: boolean;
  time: string;          // "08:00" - user's preferred reminder time
  sound: boolean;
}
```

### App State (Zustand)
```typescript
interface AppState {
  profile: UserProfile | null;
  entries: WeightEntry[];
  goal: Goal | null;
  streak: number;                // consecutive days logged
  lastLogDate: string | null;    // YYYY-MM-DD
  notificationSettings: NotificationSettings;

  // Actions
  addEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  setProfile: (profile: UserProfile) => void;
  setGoal: (goal: Goal) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}
```

**Key decisions:**
- Store everything in metric (kg/cm) internally — convert on display
- Streak calculated by comparing `lastLogDate` to today
- One active goal at a time
- IDs are UUIDs for future-proofing

### BMI Calculation
```typescript
// BMI = weight (kg) / height (m)²
function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

// BMI Categories (WHO standard)
// Underweight: < 18.5
// Normal: 18.5 - 24.9
// Overweight: 25 - 29.9
// Obese: >= 30
```

## Color System: Rosy Peach

### Light Mode
```css
--background: #FFF7F5;           /* warm cream background */
--foreground: #5D4954;           /* warm brown text */

--primary: #F28B82;              /* soft coral-pink */
--primary-foreground: #FFFFFF;

--secondary: #FBCEB1;            /* warm apricot */
--secondary-foreground: #5D4954;

--accent: #FFF0EB;               /* light peach */
--accent-foreground: #5D4954;

--success: #81C995;              /* soft green */
--warning: #FFB74D;              /* warm orange */
--muted: #F5EEEB;                /* neutral background */
```

### Dark Mode
```css
--background: #1C1517;           /* deep warm brown */
--foreground: #FFF0EB;           /* cream text */

--primary: #D4736B;              /* muted coral */
--primary-foreground: #1C1517;

--secondary: #E0A88A;            /* muted apricot */
--secondary-foreground: #1C1517;

--accent: #2D2226;               /* dark card background */
--accent-foreground: #FFF0EB;

--success: #5DA36A;              /* muted green */
--warning: #CC8C3D;              /* muted orange */
```

### Color Usage
- **Primary (coral-pink):** Main CTA buttons, hamster body, active states
- **Secondary (apricot):** Streak badges, highlights, chart accents
- **Accent (peach):** Card backgrounds, input fields
- **Success (green):** Goal reached, positive trends
- **Warning (orange):** Approaching deadline, attention needed

## Hamster Component System

### Expression Types
```typescript
type EmotionalState =
  | 'happy'           // default
  | 'sleepy'
  | 'cheerUp'
  | 'youCanDoIt'
  | 'bringItOn'
  | 'imTheBest'
  | 'feelingTired'
  | 'exhausted';

type ActivityState =
  | 'runningWheel'
  | 'treadmill'
  | 'coreExercise'
  | 'measuringWeight'
  | 'checkingHealth';

type HamsterExpression = EmotionalState | ActivityState;
```

### Component API
```typescript
<Hamster
  expression="happy"
  size="lg"           // sm | md | lg | xl
  animate={true}      // idle animations (breathing, blinking)
/>
```

### Expression Triggers

| Context | Expression |
|---------|------------|
| Dashboard (default) | `happy` |
| Morning (6am-10am) | `sleepy` |
| Weight input modal open | `measuringWeight` |
| After saving weight | `cheerUp` or `youCanDoIt` |
| Goal achieved | `imTheBest` |
| Streak milestone (7, 30, 100 days) | `bringItOn` |
| Exercise context = "after" | `exhausted` |
| Evening (8pm+) | `feelingTired` |
| Viewing charts/history | `checkingHealth` |
| Exercise context = "before" | `runningWheel` (random: 70% wheel, 30% treadmill) |

### Activity Expression Selection
- `runningWheel`: Default exercise animation, most common
- `treadmill`: Alternate exercise animation, randomly selected 30% of time
- `coreExercise`: Reserved for future "exercise type" selection feature (post-MVP)

### Animation Approach
- Base SVG with Framer Motion for transitions
- Each expression = different eyes, mouth, pose, accessories
- Idle animations: gentle breathing, occasional blink
- Transition animations: smooth morph between expressions

## Pages & Navigation

### Bottom Navigation
```
┌────┬────┬────┬────┐
│ 🏠 │ 📊 │ 🎯 │ ⚙️ │
│Home│Hist│Goal│Set │
└────┴────┴────┴────┘
```

### Page Overview

| Page | Purpose | Key Components |
|------|---------|----------------|
| **Home** | Dashboard, quick log | Hamster, weight input, today's stats, mini chart, streak |
| **History** | Past entries | Calendar view, list of entries, filter by week/month |
| **Goals** | Goal management | Current goal progress, set/edit goal, projected timeline |
| **Settings** | Preferences | Units toggle, dark mode, notifications, height, export data |

### Dashboard Layout (Input-Centric)
- Main action (weight logging) is the hero element
- Hamster embedded in the input area
- Quick stats row below (streak, weekly change)
- Mini trend chart at bottom

### Weight Input Flow (Smart Defaults)
- User taps main input area
- Bottom sheet slides up with weight input
- Time of day auto-detected from current time:
  - Morning: 5:00 AM - 11:59 AM
  - Lunch: 12:00 PM - 1:59 PM
  - Afternoon: 2:00 PM - 5:59 PM
  - Evening: 6:00 PM - 4:59 AM
- Exercise context defaults to "none"
- "Change" link to override if needed
- Single "Save" button

## Streak System

### Logic
- Streak increments when user logs at least once per calendar day
- Streak resets to 0 if a full day is missed
- No grace period (keeps it simple and motivating)

### Milestones
| Days | Hamster Reaction | Reward |
|------|------------------|--------|
| 3 | `cheerUp` | Encouragement message |
| 7 | `bringItOn` | Badge unlocked |
| 14 | `youCanDoIt` | Badge |
| 30 | `imTheBest` | Celebration animation |
| 100 | `imTheBest` | Special celebration |

### UI
- Displayed on home dashboard: "🔥 5 days"
- Streak history visible in Settings
- Lost streak shows encouraging message, not punishment

## Notifications

### Implementation
- Uses Web Notifications API (browser permission required)
- Default reminder time: 8:00 AM
- User can adjust time in Settings

### Message Rotation
- "🐹 Time to weigh in! Your hamster is waiting..."
- "🐹 Good morning! Let's check your progress today"
- "🐹 Don't break your streak! Quick weigh-in?"

## First-Time Onboarding

Three screens shown only on first launch:

1. **Welcome:** Hamster introduction, "Get Started" button
2. **Setup:** Height input, unit selection (kg/cm or lb/in)
3. **First Weight:** Initial weight entry to begin tracking

- Stored in localStorage as `onboardingComplete: true`
- Goal setup prompted after 3 weight entries (not during onboarding)

## MVP Scope

### Included
- Weight logging with context (time, exercise)
- Height input for BMI calculation
- Dashboard with today's stats and trend chart
- Weekly/monthly history view
- Goal setting (lose/gain/maintain with optional deadline)
- Streak counter
- Dark mode
- Daily reminder notifications
- 13 hamster expressions with animations
- Metric/imperial unit toggle

### Deferred (Post-MVP)
- Hamster levels up / changes outfits based on streak
- PWA support for home screen installation
- Cloud sync with Supabase
- Social features / sharing

## Success Criteria

1. User can log weight in under 5 seconds (tap → enter number → save)
2. App works fully offline (localStorage)
3. Hamster expressions respond appropriately to context
4. Dark mode respects system preference and manual toggle
5. All UI accessible (shadcn/ui provides this baseline)
