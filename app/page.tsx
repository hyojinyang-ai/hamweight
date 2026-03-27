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
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">HamWeight</h1>
        <span className="text-sm font-medium text-muted-foreground">햄웨이트</span>
      </header>

      <WeightCard />
      <StatsRow />
      <TrendChart days={7} />
    </div>
  );
}
