"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { getTranslations, type Locale } from "@/lib/i18n";
import {
  cn,
  formatWeightChange,
  getWeightChangeDirection,
} from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

interface WeightChangeBadgeProps {
  deltaKg?: number | null;
  unit: UserProfile["unit"];
  language: Locale;
  className?: string;
  showContext?: boolean;
  showFirstLog?: boolean;
  showReassurance?: boolean;
  variant?: "badge" | "plain";
  parenthesized?: boolean;
}

export function WeightChangeBadge({
  deltaKg,
  unit,
  language,
  className,
  showContext = false,
  showFirstLog = false,
  showReassurance = false,
  variant = "badge",
  parenthesized = false,
}: WeightChangeBadgeProps) {
  const t = getTranslations(language);
  const isPlain = variant === "plain";

  if (deltaKg === null || typeof deltaKg === "undefined") {
    if (!showFirstLog) return null;

    return (
      <span
        className={cn(
          isPlain
            ? "inline-flex items-center rounded-full px-0 py-0 text-[11px] font-black text-foreground/55"
            : "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-black text-foreground/55 [border:var(--neo-border)]",
          className
        )}
      >
        {parenthesized ? `(${t.firstLog})` : t.firstLog}
      </span>
    );
  }

  const direction = getWeightChangeDirection(deltaKg, unit);
  const Icon =
    direction === "increase"
      ? TrendingUp
      : direction === "decrease"
        ? TrendingDown
        : Minus;
  const label =
    direction === "increase"
      ? t.increased
      : direction === "decrease"
        ? t.decreased
        : t.noChange;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-[11px] font-black",
        isPlain ? "px-0 py-0" : "px-2.5 py-1 [border:var(--neo-border)]",
        !isPlain && direction === "increase" && "bg-warning/25 text-foreground",
        !isPlain && direction === "decrease" && "bg-success/15 text-foreground",
        !isPlain && direction === "same" && "bg-muted text-foreground/60",
        isPlain && direction !== "same" && "text-foreground",
        isPlain && direction === "same" && "text-foreground/60",
        className
      )}
      aria-label={`${label} ${formatWeightChange(deltaKg, unit)}${
        showContext ? ` ${t.fromLastLog}` : ""
      }`}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          direction === "increase" && "text-warning",
          direction === "decrease" && "text-success",
          direction === "same" && "text-muted-foreground"
        )}
        strokeWidth={3}
      />
      <span>{parenthesized ? "(" + label : label}</span>
      <span>
        {parenthesized && !showContext
          ? formatWeightChange(deltaKg, unit) + ")"
          : formatWeightChange(deltaKg, unit)}
      </span>
      {showContext && (
        <span className="font-bold text-foreground/50">
          {parenthesized ? t.fromLastLog + ")" : t.fromLastLog}
        </span>
      )}
      {showReassurance && direction === "increase" && (
        <span className="ml-0.5 font-bold text-foreground/40">
          · {t.fluctuationNormal}
        </span>
      )}
    </span>
  );
}
