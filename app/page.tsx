// app/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/lib/store";
import { WeightCard } from "@/components/weight/WeightCard";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { StreakCelebration } from "@/components/celebration/StreakCelebration";
import { GoalProgressRing } from "@/components/dashboard/GoalProgressRing";
import { STREAK_MILESTONES } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n";

export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const streak = useStore((s) => s.streak);
  const profile = useStore((s) => s.profile);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStreakRef = useRef(streak);

  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

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
      <div className="mx-auto max-w-md space-y-4 px-4 py-6">
        <header className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{t.appName}</h1>
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium tracking-[0.08em] [border:var(--neo-border)]">{t.appNameKr}</span>
        </header>

        <WeightCard />
        <ActivityHeatmap />
        <GoalProgressRing />
      </div>

      <StreakCelebration
        streak={streak}
        show={showCelebration}
        onClose={handleCloseCelebration}
      />
    </>
  );
}
