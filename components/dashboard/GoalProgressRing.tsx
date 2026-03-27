// components/dashboard/GoalProgressRing.tsx
"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatWeight } from "@/lib/utils";
import { Target } from "lucide-react";
import Link from "next/link";

export function GoalProgressRing() {
  const goal = useStore((s) => s.goal);
  const profile = useStore((s) => s.profile);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";

  if (!goal || !latestEntry) {
    return (
      <Link href="/goals">
        <Card className="flex items-center justify-center gap-3 p-4 transition-colors hover:bg-accent/50">
          <Target className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Set a weight goal</span>
        </Card>
      </Link>
    );
  }

  const currentWeight = latestEntry.weight;
  const { startWeight, targetWeight, type } = goal;

  // Calculate progress
  const totalChange = Math.abs(targetWeight - startWeight);
  const currentChange = Math.abs(currentWeight - startWeight);

  let progress: number;
  if (type === "maintain") {
    // For maintain, 100% when at target, decreases as you deviate
    const deviation = Math.abs(currentWeight - targetWeight);
    progress = Math.max(0, 1 - deviation / 5); // 5kg deviation = 0%
  } else if (type === "lose") {
    // For lose: progress when weight decreases toward target
    if (currentWeight <= targetWeight) {
      progress = 1; // Goal achieved
    } else if (currentWeight >= startWeight) {
      progress = 0; // No progress or gained weight
    } else {
      progress = (startWeight - currentWeight) / (startWeight - targetWeight);
    }
  } else {
    // For gain: progress when weight increases toward target
    if (currentWeight >= targetWeight) {
      progress = 1; // Goal achieved
    } else if (currentWeight <= startWeight) {
      progress = 0; // No progress or lost weight
    } else {
      progress = (currentWeight - startWeight) / (targetWeight - startWeight);
    }
  }

  progress = Math.min(1, Math.max(0, progress));
  const percentage = Math.round(progress * 100);

  // SVG circle properties
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const remainingWeight = Math.abs(currentWeight - targetWeight);
  const isGoalReached = progress >= 1;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg width={size} height={size} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isGoalReached ? "hsl(var(--success))" : "hsl(var(--primary))"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium">
            {isGoalReached ? (
              <span className="text-success">Goal Reached!</span>
            ) : (
              <>
                {formatWeight(remainingWeight, unit).split(" ")[0]}{" "}
                <span className="text-muted-foreground">
                  {unit === "imperial" ? "lb" : "kg"} to go
                </span>
              </>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Target: {formatWeight(targetWeight, unit)}
          </div>
        </div>
      </div>
    </Card>
  );
}
