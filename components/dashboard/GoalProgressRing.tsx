"use client";

import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

export function GoalProgressRing() {
  const goal = useStore((s) => s.goal);
  const profile = useStore((s) => s.profile);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  if (!goal || !latestEntry) {
    return null;
  }

  const currentWeight = latestEntry.weight;
  const { targetWeight, type, startWeight } = goal;

  let progress: number;
  if (type === "maintain") {
    const deviation = Math.abs(currentWeight - targetWeight);
    progress = Math.max(0, 1 - deviation / 5);
  } else if (type === "lose") {
    if (currentWeight <= targetWeight) {
      progress = 1;
    } else if (currentWeight >= startWeight) {
      progress = 0;
    } else {
      progress = (startWeight - currentWeight) / (startWeight - targetWeight);
    }
  } else {
    if (currentWeight >= targetWeight) {
      progress = 1;
    } else if (currentWeight <= startWeight) {
      progress = 0;
    } else {
      progress = (currentWeight - startWeight) / (targetWeight - startWeight);
    }
  }

  progress = Math.min(1, Math.max(0, progress));
  const percentage = Math.round(progress * 100);
  const remainingWeight = Math.abs(currentWeight - targetWeight);
  const isGoalReached = progress >= 1;

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-black">{t.progress}</div>
        <div className="text-sm font-black">{percentage}%</div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${isGoalReached ? "bg-success" : "bg-primary"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="font-bold text-foreground/70">
          {isGoalReached ? (
            <span className="text-success">{t.goalReached}</span>
          ) : (
            <>
              {formatWeight(remainingWeight, unit).split(" ")[0]} {unit === "imperial" ? "lb" : "kg"} {t.toGo}
            </>
          )}
        </div>
        <div className="font-bold text-foreground/60">
          {t.target}: {formatWeight(targetWeight, unit)}
        </div>
      </div>
    </Card>
  );
}
