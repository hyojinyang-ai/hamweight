// components/weight/WeightCard.tsx
"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { WeightChangeBadge } from "@/components/weight/WeightChangeBadge";
import { useStore } from "@/lib/store";
import { formatWeight, calculateBMI, getBMICategory, getWeightChangeByEntryId } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

export function WeightCard() {
  const profile = useStore((s) => s.profile);
  const entries = useStore((s) => s.entries);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  const bmiRaw = latestEntry && profile?.height
    ? calculateBMI(latestEntry.weight, profile.height)
    : null;
  const bmi = bmiRaw !== null && isFinite(bmiRaw) ? bmiRaw : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const latestChange = useMemo(() => {
    if (!latestEntry) return null;
    return getWeightChangeByEntryId(entries).get(latestEntry.id) ?? null;
  }, [entries, latestEntry]);

  return (
    <Card className="relative overflow-hidden p-0">
      {/* Hero Image */}
      <Image
        src="/images/myweight-hero.png"
        alt="MyWeight"
        width={800}
        height={400}
        sizes="(max-width: 448px) 100vw, 448px"
        className="w-full object-cover"
        priority
      />

      {/* Divider */}
      <div className="border-t-[2.5px] border-foreground/15" />

      {/* Weight Display */}
      <div className="flex flex-col items-center gap-3 p-5 sm:p-6">
        <div className="text-center">
          {latestEntry ? (
            <>
              <div className="text-6xl font-black tracking-[-0.05em] text-foreground sm:text-7xl">
                {formatWeight(latestEntry.weight, unit).split(" ")[0]}
              </div>
              <div className="mt-1.5 text-sm font-bold uppercase tracking-[0.24em] text-foreground/45">
                {unit === "imperial" ? "lb" : "kg"}
              </div>
              <WeightChangeBadge
                deltaKg={latestChange}
                unit={unit}
                language={lang}
                showContext
                showReassurance
                variant="plain"
                parenthesized
                className="mt-3 justify-center text-sm"
              />
              {bmi && (
                <div className="mt-3">
                  <span className="inline-flex rounded-full bg-secondary px-4 py-1.5 text-sm font-bold [border:var(--neo-border)]">
                    {t.bmi} {bmi.toFixed(1)} · {bmiCategory?.label}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto max-w-[16rem] py-2 text-center">
              <div className="text-base font-black text-foreground/60">{t.tapToLog}</div>
              <div className="mt-1 text-sm font-bold text-foreground/40">{t.noEntriesEncouragement}</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
