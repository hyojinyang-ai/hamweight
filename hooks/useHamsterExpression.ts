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
