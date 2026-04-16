// components/dashboard/StatsRow.tsx
"use client";

import { useMemo } from "react";
import { Flame, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight, calculateBMI, getBMICategory } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

export function StatsRow() {
  const profile = useStore((s) => s.profile);
  const streak = useStore((s) => s.streak);
  const getLatestEntry = useStore((s) => s.getLatestEntry);
  const getEntriesForDays = useStore((s) => s.getEntriesForDays);

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
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
      <Card className="bg-card p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Flame className="h-4 w-4 text-foreground" />
          <span className="text-2xl font-bold tracking-tight">{streak}</span>
        </div>
        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">{t.streak}</div>
      </Card>

      {/* Weekly Change */}
      <Card className="bg-card p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {getTrendIcon()}
          <span className="text-2xl font-bold tracking-tight">
            {weeklyChange > 0 ? "+" : ""}
            {formatWeight(Math.abs(weeklyChange), unit).split(" ")[0]}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">{t.week}</div>
      </Card>

      {/* BMI */}
      <Card className="bg-card p-3.5 text-center">
        <div className="text-2xl font-bold tracking-tight">
          {bmi > 0 ? bmi.toFixed(1) : "—"}
        </div>
        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/50">
          {bmiCategory?.label ?? "BMI"}
        </div>
      </Card>
    </div>
  );
}
