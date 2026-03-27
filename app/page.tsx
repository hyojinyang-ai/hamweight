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
