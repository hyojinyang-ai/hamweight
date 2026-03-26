# HamWeight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a weight tracking web app with a cute hamster mascot that makes logging weight dead simple.

**Architecture:** Next.js 14 App Router with Zustand for state management persisted to localStorage. Hamster SVG component with 13 animated expressions. Mobile-first responsive design with shadcn/ui components themed in Rosy Peach colors.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, Recharts, Lucide React

---

## File Structure

```
hamweight/
├── app/
│   ├── globals.css              # Tailwind + CSS variables (Rosy Peach)
│   ├── layout.tsx               # Root layout + ThemeProvider
│   ├── page.tsx                 # Dashboard/Home
│   ├── history/page.tsx         # Weight history
│   ├── goals/page.tsx           # Goal management
│   └── settings/page.tsx        # Preferences
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── hamster/
│   │   ├── Hamster.tsx          # Main component
│   │   └── expressions.tsx      # All 13 expressions as variants
│   ├── weight/
│   │   ├── WeightCard.tsx       # Dashboard input card
│   │   └── WeightSheet.tsx      # Bottom sheet input
│   ├── charts/
│   │   └── TrendChart.tsx       # Recharts wrapper
│   ├── layout/
│   │   └── BottomNav.tsx        # Navigation
│   └── onboarding/
│       └── OnboardingFlow.tsx   # 3-step onboarding
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   ├── store.ts                 # Zustand store
│   ├── utils.ts                 # BMI, unit conversion, time detection
│   └── constants.ts             # Colors, time ranges, messages
└── hooks/
    ├── useHamsterExpression.ts  # Determine current expression
    └── useNotifications.ts      # Web notifications
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`

- [ ] **Step 1: Create Next.js project**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

- [ ] **Step 2: Verify project runs**

Run: `npm run dev`
Expected: App running at http://localhost:3000

- [ ] **Step 3: Install dependencies**

```bash
npm install zustand framer-motion recharts lucide-react uuid
npm install -D @types/uuid
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Slate, CSS variables: yes

- [ ] **Step 5: Add shadcn components**

```bash
npx shadcn@latest add button card input sheet dialog label switch select
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js 14 project with dependencies"
```

---

## Task 2: Types & Constants

**Files:**
- Create: `lib/types.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/types.ts
export interface WeightEntry {
  id: string;
  weight: number; // always kg
  timestamp: string; // ISO string
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'evening';
  exerciseContext: 'before' | 'after' | 'none';
}

export interface UserProfile {
  height: number; // always cm
  unit: 'metric' | 'imperial';
  createdAt: string;
}

export interface Goal {
  type: 'lose' | 'gain' | 'maintain';
  targetWeight: number; // kg
  deadline?: string; // ISO string
  startWeight: number;
  startDate: string;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  sound: boolean;
}

export type EmotionalState =
  | 'happy'
  | 'sleepy'
  | 'cheerUp'
  | 'youCanDoIt'
  | 'bringItOn'
  | 'imTheBest'
  | 'feelingTired'
  | 'exhausted';

export type ActivityState =
  | 'runningWheel'
  | 'treadmill'
  | 'coreExercise'
  | 'measuringWeight'
  | 'checkingHealth';

export type HamsterExpression = EmotionalState | ActivityState;

export type HamsterSize = 'sm' | 'md' | 'lg' | 'xl';
```

- [ ] **Step 2: Create constants file**

```typescript
// lib/constants.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/constants.ts
git commit -m "feat: add TypeScript types and constants"
```

---

## Task 3: Utility Functions

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: Create utils with BMI calculation**

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TIME_RANGES, BMI_CATEGORIES } from "./constants";
import type { WeightEntry } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number) {
  if (bmi < BMI_CATEGORIES.underweight.max) return BMI_CATEGORIES.underweight;
  if (bmi < BMI_CATEGORIES.normal.max) return BMI_CATEGORIES.normal;
  if (bmi < BMI_CATEGORIES.overweight.max) return BMI_CATEGORIES.overweight;
  return BMI_CATEGORIES.obese;
}

export function kgToLb(kg: number): number {
  return kg * 2.20462;
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function getTimeOfDay(): WeightEntry['timeOfDay'] {
  const hour = new Date().getHours();

  if (hour >= TIME_RANGES.morning.start && hour <= TIME_RANGES.morning.end) {
    return 'morning';
  }
  if (hour >= TIME_RANGES.lunch.start && hour <= TIME_RANGES.lunch.end) {
    return 'lunch';
  }
  if (hour >= TIME_RANGES.afternoon.start && hour <= TIME_RANGES.afternoon.end) {
    return 'afternoon';
  }
  return 'evening';
}

export function formatWeight(kg: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${kgToLb(kg).toFixed(1)} lb`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1.slice(0, 10) === date2.slice(0, 10);
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add utility functions for BMI, units, time"
```

---

## Task 4: Zustand Store

**Files:**
- Create: `lib/store.ts`

- [ ] **Step 1: Create Zustand store with localStorage persistence**

```typescript
// lib/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { WeightEntry, UserProfile, Goal, NotificationSettings } from './types';
import { getTodayISO, isSameDay } from './utils';

interface AppState {
  // State
  profile: UserProfile | null;
  entries: WeightEntry[];
  goal: Goal | null;
  streak: number;
  lastLogDate: string | null;
  notificationSettings: NotificationSettings;
  onboardingComplete: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  addEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  setGoal: (goal: Goal | null) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  completeOnboarding: () => void;

  // Computed helpers
  getLatestEntry: () => WeightEntry | null;
  getTodayEntries: () => WeightEntry[];
  getEntriesForDays: (days: number) => WeightEntry[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      entries: [],
      goal: null,
      streak: 0,
      lastLogDate: null,
      notificationSettings: {
        enabled: false,
        time: '08:00',
        sound: true,
      },
      onboardingComplete: false,

      // Actions
      setProfile: (profile) => set({ profile }),

      addEntry: (entryData) => {
        const today = getTodayISO();
        const { lastLogDate, streak } = get();

        let newStreak = streak;
        if (lastLogDate) {
          const lastDate = new Date(lastLogDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0) {
            // Same day, streak unchanged
          } else if (diffDays === 1) {
            // Consecutive day, increment streak
            newStreak = streak + 1;
          } else {
            // Missed days, reset streak
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const entry: WeightEntry = {
          ...entryData,
          id: uuidv4(),
        };

        set((state) => ({
          entries: [...state.entries, entry],
          streak: newStreak,
          lastLogDate: today,
        }));
      },

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      setGoal: (goal) => set({ goal }),

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: { ...state.notificationSettings, ...settings },
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      // Computed helpers
      getLatestEntry: () => {
        const { entries } = get();
        if (entries.length === 0) return null;
        return entries.reduce((latest, entry) =>
          new Date(entry.timestamp) > new Date(latest.timestamp) ? entry : latest
        );
      },

      getTodayEntries: () => {
        const { entries } = get();
        const today = getTodayISO();
        return entries.filter((e) => isSameDay(e.timestamp, today));
      },

      getEntriesForDays: (days) => {
        const { entries } = get();
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return entries.filter((e) => new Date(e.timestamp) >= cutoff);
      },
    }),
    {
      name: 'hamweight-storage',
    }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add lib/store.ts
git commit -m "feat: add Zustand store with localStorage persistence"
```

---

## Task 5: Color Theme Setup

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update globals.css with Rosy Peach theme**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 12 100% 98%;
    --foreground: 340 15% 33%;

    --card: 15 100% 96%;
    --card-foreground: 340 15% 33%;

    --popover: 12 100% 98%;
    --popover-foreground: 340 15% 33%;

    --primary: 4 83% 73%;
    --primary-foreground: 0 0% 100%;

    --secondary: 25 91% 84%;
    --secondary-foreground: 340 15% 33%;

    --muted: 20 33% 95%;
    --muted-foreground: 340 10% 50%;

    --accent: 15 100% 96%;
    --accent-foreground: 340 15% 33%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --success: 135 40% 64%;
    --success-foreground: 0 0% 100%;

    --warning: 36 100% 65%;
    --warning-foreground: 340 15% 33%;

    --border: 20 30% 90%;
    --input: 20 30% 90%;
    --ring: 4 83% 73%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 350 20% 10%;
    --foreground: 15 100% 96%;

    --card: 350 15% 14%;
    --card-foreground: 15 100% 96%;

    --popover: 350 20% 10%;
    --popover-foreground: 15 100% 96%;

    --primary: 4 55% 62%;
    --primary-foreground: 350 20% 10%;

    --secondary: 20 50% 71%;
    --secondary-foreground: 350 20% 10%;

    --muted: 350 12% 18%;
    --muted-foreground: 20 20% 70%;

    --accent: 350 15% 16%;
    --accent-foreground: 15 100% 96%;

    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 100%;

    --success: 135 35% 50%;
    --success-foreground: 0 0% 100%;

    --warning: 36 60% 52%;
    --warning-foreground: 350 20% 10%;

    --border: 350 12% 22%;
    --input: 350 12% 22%;
    --ring: 4 55% 62%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Update tailwind.config.ts with success/warning colors**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: add Rosy Peach color theme with dark mode"
```

---

## Task 6: Theme Provider & Layout

**Files:**
- Create: `components/theme-provider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install next-themes**

```bash
npm install next-themes
```

- [ ] **Step 2: Create theme provider**

```typescript
// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Update root layout**

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HamWeight - 햄웨이트",
  description: "Simple weight tracking with your hamster buddy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen pb-20">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/theme-provider.tsx app/layout.tsx package.json package-lock.json
git commit -m "feat: add theme provider with system preference support"
```

---

## Task 7: Bottom Navigation

**Files:**
- Create: `components/layout/BottomNav.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create BottomNav component**

```typescript
// components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Target, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/history", icon: History, label: "History" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add BottomNav to layout**

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HamWeight - 햄웨이트",
  description: "Simple weight tracking with your hamster buddy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen pb-20">{children}</main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/layout/BottomNav.tsx app/layout.tsx
git commit -m "feat: add bottom navigation component"
```

---

## Task 8: Hamster Component (Part 1 - Base)

**Files:**
- Create: `components/hamster/Hamster.tsx`

- [ ] **Step 1: Create base Hamster component with happy expression**

```typescript
// components/hamster/Hamster.tsx
"use client";

import { motion } from "framer-motion";
import type { HamsterExpression, HamsterSize } from "@/lib/types";
import { HAMSTER_SIZES } from "@/lib/constants";

interface HamsterProps {
  expression?: HamsterExpression;
  size?: HamsterSize;
  animate?: boolean;
  className?: string;
}

export function Hamster({
  expression = "happy",
  size = "md",
  animate = true,
  className,
}: HamsterProps) {
  const sizeValue = HAMSTER_SIZES[size];

  return (
    <motion.svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 100 100"
      className={className}
      animate={animate ? { scale: [1, 1.02, 1] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* Body */}
      <motion.ellipse
        cx="50"
        cy="55"
        rx="35"
        ry="30"
        className="fill-primary"
      />

      {/* Belly */}
      <ellipse
        cx="50"
        cy="60"
        rx="25"
        ry="20"
        className="fill-secondary"
      />

      {/* Left Ear */}
      <circle cx="25" cy="30" r="12" className="fill-primary" />
      <circle cx="25" cy="30" r="7" className="fill-secondary" />

      {/* Right Ear */}
      <circle cx="75" cy="30" r="12" className="fill-primary" />
      <circle cx="75" cy="30" r="7" className="fill-secondary" />

      {/* Face */}
      <circle cx="50" cy="45" r="25" className="fill-primary" />

      {/* Cheeks */}
      <circle cx="30" cy="50" r="8" className="fill-secondary opacity-70" />
      <circle cx="70" cy="50" r="8" className="fill-secondary opacity-70" />

      {/* Eyes - varies by expression */}
      <HamsterEyes expression={expression} animate={animate} />

      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4" ry="3" className="fill-foreground" />

      {/* Mouth - varies by expression */}
      <HamsterMouth expression={expression} />

      {/* Whiskers */}
      <g className="stroke-foreground/50" strokeWidth="1">
        <line x1="20" y1="48" x2="35" y2="50" />
        <line x1="20" y1="52" x2="35" y2="52" />
        <line x1="65" y1="50" x2="80" y2="48" />
        <line x1="65" y1="52" x2="80" y2="52" />
      </g>
    </motion.svg>
  );
}

function HamsterEyes({ expression, animate }: { expression: HamsterExpression; animate: boolean }) {
  const isSleepy = expression === "sleepy" || expression === "exhausted" || expression === "feelingTired";
  const isHappy = expression === "happy" || expression === "cheerUp" || expression === "imTheBest";

  if (isSleepy) {
    return (
      <>
        <line x1="38" y1="42" x2="46" y2="42" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="42" x2="62" y2="42" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  if (isHappy) {
    return (
      <>
        <path d="M38 44 Q42 40 46 44" className="stroke-foreground fill-none" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 44 Q58 40 62 44" className="stroke-foreground fill-none" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  // Default open eyes
  return (
    <>
      <motion.circle
        cx="42"
        cy="42"
        r="4"
        className="fill-foreground"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? { duration: 0.2, repeat: Infinity, repeatDelay: 4 } : undefined}
      />
      <motion.circle
        cx="58"
        cy="42"
        r="4"
        className="fill-foreground"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? { duration: 0.2, repeat: Infinity, repeatDelay: 4 } : undefined}
      />
      <circle cx="43" cy="41" r="1.5" className="fill-white" />
      <circle cx="59" cy="41" r="1.5" className="fill-white" />
    </>
  );
}

function HamsterMouth({ expression }: { expression: HamsterExpression }) {
  const isBig = expression === "imTheBest" || expression === "bringItOn";
  const isSmile = expression === "happy" || expression === "cheerUp" || expression === "youCanDoIt";

  if (isBig) {
    return (
      <path
        d="M42 55 Q50 65 58 55"
        className="stroke-foreground fill-none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  if (isSmile) {
    return (
      <path
        d="M44 54 Q50 59 56 54"
        className="stroke-foreground fill-none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  // Neutral mouth
  return (
    <path
      d="M46 55 Q50 57 54 55"
      className="stroke-foreground fill-none"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hamster/Hamster.tsx
git commit -m "feat: add Hamster SVG component with expressions"
```

---

## Task 9: Hamster Expression Hook

**Files:**
- Create: `hooks/useHamsterExpression.ts`

- [ ] **Step 1: Create expression determination hook**

```typescript
// hooks/useHamsterExpression.ts
"use client";

import { useMemo } from "react";
import type { HamsterExpression } from "@/lib/types";
import { useStore } from "@/lib/store";
import { STREAK_MILESTONES } from "@/lib/constants";

type Context =
  | "dashboard"
  | "weightInput"
  | "afterSave"
  | "history"
  | "goalAchieved";

interface UseHamsterExpressionOptions {
  context?: Context;
  exerciseContext?: "before" | "after" | "none";
}

export function useHamsterExpression(
  options: UseHamsterExpressionOptions = {}
): HamsterExpression {
  const { context = "dashboard", exerciseContext = "none" } = options;
  const streak = useStore((s) => s.streak);
  const goal = useStore((s) => s.goal);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  return useMemo(() => {
    // Priority 1: Context-specific expressions
    if (context === "weightInput") {
      return "measuringWeight";
    }

    if (context === "afterSave") {
      return Math.random() > 0.5 ? "cheerUp" : "youCanDoIt";
    }

    if (context === "history") {
      return "checkingHealth";
    }

    if (context === "goalAchieved") {
      return "imTheBest";
    }

    // Priority 2: Exercise context
    if (exerciseContext === "after") {
      return "exhausted";
    }

    if (exerciseContext === "before") {
      return Math.random() > 0.3 ? "runningWheel" : "treadmill";
    }

    // Priority 3: Streak milestones (check on dashboard)
    if (context === "dashboard" && STREAK_MILESTONES.includes(streak as any)) {
      if (streak >= 30) return "imTheBest";
      if (streak >= 7) return "bringItOn";
      return "cheerUp";
    }

    // Priority 4: Time of day
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) {
      return "sleepy";
    }

    if (hour >= 20 || hour < 5) {
      return "feelingTired";
    }

    // Default
    return "happy";
  }, [context, exerciseContext, streak, goal, getLatestEntry]);
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useHamsterExpression.ts
git commit -m "feat: add useHamsterExpression hook for context-aware expressions"
```

---

## Task 10: Weight Input Sheet

**Files:**
- Create: `components/weight/WeightSheet.tsx`

- [ ] **Step 1: Create weight input bottom sheet**

```typescript
// components/weight/WeightSheet.tsx
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { getTimeOfDay, formatWeight, kgToLb, lbToKg } from "@/lib/utils";
import type { WeightEntry } from "@/lib/types";

interface WeightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function WeightSheet({ open, onOpenChange, onSave }: WeightSheetProps) {
  const profile = useStore((s) => s.profile);
  const addEntry = useStore((s) => s.addEntry);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const unit = profile?.unit ?? "metric";
  const latestEntry = getLatestEntry();
  const defaultWeight = latestEntry?.weight ?? 70;

  const [weight, setWeight] = useState<string>("");
  const [timeOfDay, setTimeOfDay] = useState<WeightEntry["timeOfDay"]>(getTimeOfDay());
  const [exerciseContext, setExerciseContext] = useState<WeightEntry["exerciseContext"]>("none");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (open) {
      const displayWeight = unit === "imperial" ? kgToLb(defaultWeight) : defaultWeight;
      setWeight(displayWeight.toFixed(1));
      setTimeOfDay(getTimeOfDay());
      setExerciseContext("none");
      setShowOptions(false);
    }
  }, [open, defaultWeight, unit]);

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const weightKg = unit === "imperial" ? lbToKg(weightNum) : weightNum;

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay,
      exerciseContext,
    });

    onOpenChange(false);
    onSave?.();
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const step = unit === "imperial" ? 0.2 : 0.1;
    setWeight((current + delta * step).toFixed(1));
  };

  const timeOptions: { value: WeightEntry["timeOfDay"]; label: string; emoji: string }[] = [
    { value: "morning", label: "Morning", emoji: "🌅" },
    { value: "lunch", label: "Lunch", emoji: "🌞" },
    { value: "afternoon", label: "Afternoon", emoji: "🌤️" },
    { value: "evening", label: "Evening", emoji: "🌙" },
  ];

  const exerciseOptions: { value: WeightEntry["exerciseContext"]; label: string; emoji: string }[] = [
    { value: "none", label: "No exercise", emoji: "😴" },
    { value: "before", label: "Before workout", emoji: "💪" },
    { value: "after", label: "After workout", emoji: "🏃" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-center">
          <div className="flex justify-center py-2">
            <Hamster expression="measuringWeight" size="lg" />
          </div>
          <SheetTitle>Log your weight</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Weight Input */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full text-xl"
              onClick={() => adjustWeight(-1)}
            >
              −
            </Button>
            <div className="text-center">
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-16 w-32 text-center text-3xl font-bold"
                step="0.1"
              />
              <span className="text-sm text-muted-foreground">
                {unit === "imperial" ? "lb" : "kg"}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full text-xl"
              onClick={() => adjustWeight(1)}
            >
              +
            </Button>
          </div>

          {/* Smart Defaults Display */}
          <div className="rounded-lg bg-muted p-3 text-center text-sm">
            <span className="text-muted-foreground">
              {timeOptions.find((t) => t.value === timeOfDay)?.emoji}{" "}
              {timeOptions.find((t) => t.value === timeOfDay)?.label} ·{" "}
              {exerciseOptions.find((e) => e.value === exerciseContext)?.emoji}{" "}
              {exerciseOptions.find((e) => e.value === exerciseContext)?.label}
            </span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="ml-2 text-primary underline"
            >
              {showOptions ? "Hide" : "Change"}
            </button>
          </div>

          {/* Options (collapsed by default) */}
          {showOptions && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Time of day</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {timeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={timeOfDay === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeOfDay(option.value)}
                    >
                      {option.emoji} {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Exercise</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exerciseOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={exerciseContext === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExerciseContext(option.value)}
                    >
                      {option.emoji} {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" size="lg">
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/weight/WeightSheet.tsx
git commit -m "feat: add weight input bottom sheet with smart defaults"
```

---

## Task 11: Weight Card (Dashboard Hero)

**Files:**
- Create: `components/weight/WeightCard.tsx`

- [ ] **Step 1: Create dashboard weight input card**

```typescript
// components/weight/WeightCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/hamster/Hamster";
import { WeightSheet } from "@/components/weight/WeightSheet";
import { useStore } from "@/lib/store";
import { useHamsterExpression } from "@/hooks/useHamsterExpression";
import { formatWeight } from "@/lib/utils";

export function WeightCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const profile = useStore((s) => s.profile);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";

  const expression = useHamsterExpression({
    context: justSaved ? "afterSave" : sheetOpen ? "weightInput" : "dashboard",
  });

  const handleSave = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setSheetOpen(true)}
        className="cursor-pointer"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-accent to-secondary/30 p-6">
          <div className="flex flex-col items-center gap-4">
            <Hamster expression={expression} size="xl" />

            <div className="text-center">
              {latestEntry ? (
                <>
                  <div className="text-4xl font-bold text-foreground">
                    {formatWeight(latestEntry.weight, unit).split(" ")[0]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {unit === "imperial" ? "lb" : "kg"}
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">
                  Tap to log your first weight!
                </div>
              )}
            </div>

            <div className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
              {latestEntry ? "Log Weight" : "Get Started"}
            </div>
          </div>
        </Card>
      </motion.div>

      <WeightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
      />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/weight/WeightCard.tsx
git commit -m "feat: add WeightCard dashboard component"
```

---

## Task 12: Trend Chart

**Files:**
- Create: `components/charts/TrendChart.tsx`

- [ ] **Step 1: Create trend chart component**

```typescript
// components/charts/TrendChart.tsx
"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight, formatDate } from "@/lib/utils";

interface TrendChartProps {
  days?: number;
  showCard?: boolean;
}

export function TrendChart({ days = 7, showCard = true }: TrendChartProps) {
  const entries = useStore((s) => s.getEntriesForDays(days));
  const profile = useStore((s) => s.profile);
  const unit = profile?.unit ?? "metric";

  const data = useMemo(() => {
    // Group by date and get average per day
    const byDate = entries.reduce((acc, entry) => {
      const date = entry.timestamp.slice(0, 10);
      if (!acc[date]) {
        acc[date] = { weights: [], date };
      }
      acc[date].weights.push(entry.weight);
      return acc;
    }, {} as Record<string, { weights: number[]; date: string }>);

    return Object.values(byDate)
      .map((d) => ({
        date: d.date,
        weight: d.weights.reduce((a, b) => a + b, 0) / d.weights.length,
        displayDate: formatDate(d.date),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const chartContent = (
    <div className="h-40 w-full">
      {data.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              formatter={(value: number) => [
                formatWeight(value, unit),
                "Weight",
              ]}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {data.length === 0
            ? "No data yet. Start logging!"
            : "Log more days to see trends"}
        </div>
      )}
    </div>
  );

  if (!showCard) return chartContent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Last {days} Days</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/charts/TrendChart.tsx
git commit -m "feat: add TrendChart component with Recharts"
```

---

## Task 13: Stats Row Component

**Files:**
- Create: `components/dashboard/StatsRow.tsx`

- [ ] **Step 1: Create stats row for dashboard**

```typescript
// components/dashboard/StatsRow.tsx
"use client";

import { useMemo } from "react";
import { Flame, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight, calculateBMI, getBMICategory } from "@/lib/utils";

export function StatsRow() {
  const profile = useStore((s) => s.profile);
  const streak = useStore((s) => s.streak);
  const getLatestEntry = useStore((s) => s.getLatestEntry);
  const getEntriesForDays = useStore((s) => s.getEntriesForDays);

  const unit = profile?.unit ?? "metric";
  const latestEntry = getLatestEntry();

  const { weeklyChange, bmi, bmiCategory } = useMemo(() => {
    const weekEntries = getEntriesForDays(7);
    let weeklyChange = 0;

    if (weekEntries.length >= 2) {
      const sorted = [...weekEntries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      weeklyChange = sorted[sorted.length - 1].weight - sorted[0].weight;
    }

    let bmi = 0;
    let bmiCategory = null;
    if (latestEntry && profile?.height) {
      bmi = calculateBMI(latestEntry.weight, profile.height);
      bmiCategory = getBMICategory(bmi);
    }

    return { weeklyChange, bmi, bmiCategory };
  }, [getEntriesForDays, latestEntry, profile?.height]);

  const getTrendIcon = () => {
    if (weeklyChange < -0.1) return <TrendingDown className="h-4 w-4 text-success" />;
    if (weeklyChange > 0.1) return <TrendingUp className="h-4 w-4 text-warning" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Streak */}
      <Card className="p-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Flame className="h-4 w-4 text-warning" />
          <span className="text-lg font-bold">{streak}</span>
        </div>
        <div className="text-xs text-muted-foreground">day streak</div>
      </Card>

      {/* Weekly Change */}
      <Card className="p-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {getTrendIcon()}
          <span className="text-lg font-bold">
            {weeklyChange > 0 ? "+" : ""}
            {formatWeight(Math.abs(weeklyChange), unit).split(" ")[0]}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">this week</div>
      </Card>

      {/* BMI */}
      <Card className="p-3 text-center">
        <div className="text-lg font-bold">
          {bmi > 0 ? bmi.toFixed(1) : "—"}
        </div>
        <div className="text-xs text-muted-foreground">
          {bmiCategory?.label ?? "BMI"}
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/StatsRow.tsx
git commit -m "feat: add StatsRow component for dashboard"
```

---

## Task 14: Dashboard Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Create dashboard page**

```typescript
// app/page.tsx
"use client";

import { useStore } from "@/lib/store";
import { WeightCard } from "@/components/weight/WeightCard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { TrendChart } from "@/components/charts/TrendChart";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">HamWeight</h1>
        <p className="text-sm text-muted-foreground">햄웨이트</p>
      </header>

      <WeightCard />
      <StatsRow />
      <TrendChart days={7} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: create dashboard page with weight card, stats, and chart"
```

---

## Task 15: Onboarding Flow

**Files:**
- Create: `components/onboarding/OnboardingFlow.tsx`

- [ ] **Step 1: Create onboarding component**

```typescript
// components/onboarding/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { getTimeOfDay, cmToFtIn, ftInToCm } from "@/lib/utils";

type Step = "welcome" | "setup" | "firstWeight";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weight, setWeight] = useState("70");

  const setProfile = useStore((s) => s.setProfile);
  const addEntry = useStore((s) => s.addEntry);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const handleSetupNext = () => {
    const height =
      unit === "metric"
        ? parseFloat(heightCm)
        : ftInToCm(parseInt(heightFt), parseInt(heightIn));

    setProfile({
      height,
      unit,
      createdAt: new Date().toISOString(),
    });

    // Set default weight based on unit
    if (unit === "imperial") {
      setWeight("154"); // ~70kg
    }

    setStep("firstWeight");
  };

  const handleComplete = () => {
    const weightNum = parseFloat(weight);
    const weightKg = unit === "imperial" ? weightNum / 2.20462 : weightNum;

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay: getTimeOfDay(),
      exerciseContext: "none",
    });

    completeOnboarding();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-8 text-center">
              <Hamster expression="happy" size="xl" />
              <h1 className="mt-4 text-2xl font-bold">Hi! I&apos;m Ham!</h1>
              <p className="mt-2 text-muted-foreground">
                Welcome to HamWeight. Let&apos;s make tracking your weight simple
                and fun!
              </p>
              <Button onClick={() => setStep("setup")} className="mt-6 w-full">
                Get Started
              </Button>
            </Card>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-6">
              <div className="mb-6 text-center">
                <Hamster expression="cheerUp" size="lg" />
                <h2 className="mt-2 text-xl font-bold">Quick Setup</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Preferred Units</Label>
                  <Select
                    value={unit}
                    onValueChange={(v) => setUnit(v as "metric" | "imperial")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lb, ft/in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Your Height</Label>
                  {unit === "metric" ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">cm</span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="number"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">ft</span>
                      <Input
                        type="number"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">in</span>
                    </div>
                  )}
                </div>

                <Button onClick={handleSetupNext} className="w-full">
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "firstWeight" && (
          <motion.div
            key="firstWeight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-6">
              <div className="mb-6 text-center">
                <Hamster expression="measuringWeight" size="lg" />
                <h2 className="mt-2 text-xl font-bold">Let&apos;s start!</h2>
                <p className="text-sm text-muted-foreground">
                  What&apos;s your weight today?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-32 text-center text-2xl font-bold"
                    step="0.1"
                  />
                  <span className="text-lg text-muted-foreground">
                    {unit === "imperial" ? "lb" : "kg"}
                  </span>
                </div>

                <Button onClick={handleComplete} className="w-full">
                  Save & Begin
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/onboarding/OnboardingFlow.tsx
git commit -m "feat: add 3-step onboarding flow"
```

---

## Task 16: History Page

**Files:**
- Create: `app/history/page.tsx`

- [ ] **Step 1: Create history page**

```typescript
// app/history/page.tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hamster } from "@/components/hamster/Hamster";
import { TrendChart } from "@/components/charts/TrendChart";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";

export default function HistoryPage() {
  const entries = useStore((s) => s.entries);
  const profile = useStore((s) => s.profile);
  const deleteEntry = useStore((s) => s.deleteEntry);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  const unit = profile?.unit ?? "metric";

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  const timeEmoji: Record<string, string> = {
    morning: "🌅",
    lunch: "🌞",
    afternoon: "🌤️",
    evening: "🌙",
  };

  const exerciseEmoji: Record<string, string> = {
    none: "",
    before: "💪",
    after: "🏃",
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-muted-foreground">Your weight journey</p>
        </div>
        <Hamster expression="checkingHealth" size="sm" />
      </header>

      {/* Time Range Toggle */}
      <div className="flex gap-2">
        <Button
          variant={timeRange === 7 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === 30 ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(30)}
        >
          30 Days
        </Button>
      </div>

      {/* Chart */}
      <TrendChart days={timeRange} />

      {/* Entry List */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">All Entries</h2>
        {sortedEntries.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No entries yet. Start logging!
          </Card>
        ) : (
          sortedEntries.map((entry) => (
            <Card key={entry.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">
                  {formatWeight(entry.weight, unit)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), "MMM d, yyyy h:mm a")}
                  {" · "}
                  {timeEmoji[entry.timeOfDay]}
                  {exerciseEmoji[entry.exerciseContext] && (
                    <> {exerciseEmoji[entry.exerciseContext]}</>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => deleteEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Install date-fns**

```bash
npm install date-fns
```

- [ ] **Step 3: Commit**

```bash
git add app/history/page.tsx package.json package-lock.json
git commit -m "feat: add history page with entry list and chart"
```

---

## Task 17: Goals Page

**Files:**
- Create: `app/goals/page.tsx`

- [ ] **Step 1: Create goals page**

```typescript
// app/goals/page.tsx
"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Target, Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { formatWeight, kgToLb, lbToKg } from "@/lib/utils";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const profile = useStore((s) => s.profile);
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalType, setGoalType] = useState<Goal["type"]>("lose");
  const [targetWeight, setTargetWeight] = useState("");
  const [deadline, setDeadline] = useState("");

  const unit = profile?.unit ?? "metric";
  const latestEntry = getLatestEntry();
  const currentWeight = latestEntry?.weight ?? 70;

  const handleCreateGoal = () => {
    const targetNum = parseFloat(targetWeight);
    if (isNaN(targetNum)) return;

    const targetKg = unit === "imperial" ? lbToKg(targetNum) : targetNum;

    setGoal({
      type: goalType,
      targetWeight: targetKg,
      deadline: deadline || undefined,
      startWeight: currentWeight,
      startDate: new Date().toISOString(),
    });

    setDialogOpen(false);
    setTargetWeight("");
    setDeadline("");
  };

  const getProgress = () => {
    if (!goal) return 0;
    const totalChange = Math.abs(goal.startWeight - goal.targetWeight);
    const currentChange = Math.abs(goal.startWeight - currentWeight);

    if (goal.type === "maintain") {
      // For maintain, show how close to target (100% = at target)
      const deviation = Math.abs(currentWeight - goal.targetWeight);
      return Math.max(0, 100 - deviation * 20); // -20% per kg deviation
    }

    return Math.min(100, (currentChange / totalChange) * 100);
  };

  const getGoalIcon = () => {
    if (!goal) return <Target className="h-5 w-5" />;
    if (goal.type === "lose") return <TrendingDown className="h-5 w-5 text-success" />;
    if (goal.type === "gain") return <TrendingUp className="h-5 w-5 text-warning" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const progress = getProgress();
  const isGoalAchieved = goal && progress >= 100;

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Goals</h1>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <Hamster
          expression={isGoalAchieved ? "imTheBest" : "youCanDoIt"}
          size="sm"
        />
      </header>

      {goal ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                {getGoalIcon()}
                {goal.type === "lose" && "Lose Weight"}
                {goal.type === "gain" && "Gain Weight"}
                {goal.type === "maintain" && "Maintain Weight"}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGoal(null)}
              >
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Current</div>
                <div className="text-lg font-bold">
                  {formatWeight(currentWeight, unit)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Target</div>
                <div className="text-lg font-bold">
                  {formatWeight(goal.targetWeight, unit)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Started</div>
                <div className="font-medium">
                  {format(new Date(goal.startDate), "MMM d")}
                </div>
              </div>
              {goal.deadline && (
                <div>
                  <div className="text-muted-foreground">Deadline</div>
                  <div className="font-medium">
                    {format(new Date(goal.deadline), "MMM d")}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({differenceInDays(new Date(goal.deadline), new Date())} days)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isGoalAchieved && (
              <div className="rounded-lg bg-success/20 p-3 text-center text-success">
                🎉 Goal achieved! You&apos;re amazing!
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <Hamster expression="cheerUp" size="lg" />
          <p className="mt-4 text-muted-foreground">No goal set yet</p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">Set a Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Your Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={goalType}
                    onValueChange={(v) => setGoalType(v as Goal["type"])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose Weight</SelectItem>
                      <SelectItem value="gain">Gain Weight</SelectItem>
                      <SelectItem value="maintain">Maintain Weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Weight</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder={formatWeight(currentWeight, unit).split(" ")[0]}
                    />
                    <span className="text-sm text-muted-foreground">
                      {unit === "imperial" ? "lb" : "kg"}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Deadline (optional)</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="mt-1"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <Button onClick={handleCreateGoal} className="w-full">
                  Set Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add shadcn dialog component**

```bash
npx shadcn@latest add dialog
```

- [ ] **Step 3: Commit**

```bash
git add app/goals/page.tsx components/ui/dialog.tsx
git commit -m "feat: add goals page with progress tracking"
```

---

## Task 18: Settings Page

**Files:**
- Create: `app/settings/page.tsx`
- Create: `hooks/useNotifications.ts`

- [ ] **Step 1: Create notifications hook**

```typescript
// hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { NOTIFICATION_MESSAGES } from "@/lib/constants";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const notificationSettings = useStore((s) => s.notificationSettings);
  const updateNotificationSettings = useStore((s) => s.updateNotificationSettings);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      return "denied";
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const enableNotifications = useCallback(async () => {
    const result = await requestPermission();
    if (result === "granted") {
      updateNotificationSettings({ enabled: true });
      return true;
    }
    return false;
  }, [requestPermission, updateNotificationSettings]);

  const disableNotifications = useCallback(() => {
    updateNotificationSettings({ enabled: false });
  }, [updateNotificationSettings]);

  const sendTestNotification = useCallback(() => {
    if (permission === "granted") {
      const message =
        NOTIFICATION_MESSAGES[
          Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)
        ];
      new Notification("HamWeight", {
        body: message,
        icon: "/hamster-icon.png",
      });
    }
  }, [permission]);

  return {
    permission,
    isEnabled: notificationSettings.enabled,
    time: notificationSettings.time,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    setTime: (time: string) => updateNotificationSettings({ time }),
  };
}
```

- [ ] **Step 2: Create settings page**

```typescript
// app/settings/page.tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Ruler, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { useNotifications } from "@/hooks/useNotifications";
import { cmToFtIn, ftInToCm } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const profile = useStore((s) => s.profile);
  const setProfile = useStore((s) => s.setProfile);
  const entries = useStore((s) => s.entries);
  const streak = useStore((s) => s.streak);

  const {
    permission,
    isEnabled,
    time,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    setTime,
  } = useNotifications();

  const unit = profile?.unit ?? "metric";
  const height = profile?.height ?? 170;
  const { feet, inches } = cmToFtIn(height);

  const handleUnitChange = (newUnit: "metric" | "imperial") => {
    if (profile) {
      setProfile({ ...profile, unit: newUnit });
    }
  };

  const handleHeightChange = (value: number) => {
    if (profile) {
      setProfile({ ...profile, height: value });
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      entries,
      streak,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hamweight-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
        <Hamster expression="happy" size="sm" />
      </header>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4" />
            Units & Height
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Measurement System</Label>
            <Select value={unit} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric</SelectItem>
                <SelectItem value="imperial">Imperial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Height</Label>
            {unit === "metric" ? (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">cm</span>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  value={feet}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(parseInt(e.target.value), inches))
                  }
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">ft</span>
                <Input
                  type="number"
                  value={inches}
                  onChange={(e) =>
                    handleHeightChange(ftInToCm(feet, parseInt(e.target.value)))
                  }
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Reminder</Label>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) =>
                checked ? enableNotifications() : disableNotifications()
              }
              disabled={permission === "denied"}
            />
          </div>

          {permission === "denied" && (
            <p className="text-xs text-muted-foreground">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}

          {isEnabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-28"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                className="w-full"
              >
                Send Test Notification
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-4 w-4" />
            Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {entries.length} entries · {streak} day streak
          </div>
          <Button variant="outline" onClick={handleExportData} className="w-full">
            Export Data (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/settings/page.tsx hooks/useNotifications.ts
git commit -m "feat: add settings page with theme, units, and notifications"
```

---

## Task 19: Final Polish & Testing

**Files:**
- Modify: Various files for fixes

- [ ] **Step 1: Verify all pages load without errors**

```bash
npm run dev
```

Visit each page manually:
- http://localhost:3000 (Dashboard)
- http://localhost:3000/history (History)
- http://localhost:3000/goals (Goals)
- http://localhost:3000/settings (Settings)

- [ ] **Step 2: Test onboarding flow**

Clear localStorage and reload:
1. Open DevTools → Application → Local Storage
2. Delete `hamweight-storage`
3. Reload page
4. Complete onboarding

- [ ] **Step 3: Test weight logging**

1. Tap the weight card
2. Adjust weight
3. Save
4. Verify entry appears in history

- [ ] **Step 4: Test dark mode**

1. Go to Settings
2. Toggle dark mode
3. Verify all pages look correct

- [ ] **Step 5: Build for production**

```bash
npm run build
```

Expected: No errors

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete HamWeight MVP"
```

---

## Summary

This plan implements HamWeight with:

- **18 tasks** covering all MVP features
- **Core functionality**: Weight logging, BMI, streak tracking, goals
- **UI**: Input-centric dashboard, history view, settings
- **Hamster**: 13 expression variants with context-aware display
- **Theme**: Rosy Peach color system with dark mode
- **Data**: Zustand + localStorage persistence

Post-MVP features (PWA, cloud sync, hamster outfits) are intentionally excluded per spec.
