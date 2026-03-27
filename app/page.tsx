// app/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { WeightCard } from "@/components/weight/WeightCard";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { TrendChart } from "@/components/charts/TrendChart";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { StreakCelebration } from "@/components/celebration/StreakCelebration";
import { GoalProgressRing } from "@/components/dashboard/GoalProgressRing";
import { STREAK_MILESTONES } from "@/lib/constants";

export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const streak = useStore((s) => s.streak);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    const isMilestone = STREAK_MILESTONES.includes(streak as typeof STREAK_MILESTONES[number]);
    const streakIncreased = streak > prevStreakRef.current;

    if (isMilestone && streakIncreased) {
      setShowCelebration(true);
    }

    prevStreakRef.current = streak;
  }, [streak]);

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <>
      <div className="mx-auto max-w-md space-y-5 px-4 py-6">
        <header className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold tracking-tight">HamWeight</h1>
          <span className="text-sm font-medium text-muted-foreground">햄웨이트</span>
        </header>

        <WeightCard />
        <StatsRow />
        <GoalProgressRing />
        <TrendChart days={7} />
      </div>

      <StreakCelebration
        streak={streak}
        show={showCelebration}
        onClose={handleCloseCelebration}
      />
    </>
  );
}
