// components/weight/WeightCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { WeightSheet } from "@/components/weight/WeightSheet";
import { useStore } from "@/lib/store";
import { formatWeight, calculateBMI, getBMICategory } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

export function WeightCard() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const profile = useStore((s) => s.profile);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  const bmi = latestEntry && profile?.height
    ? calculateBMI(latestEntry.weight, profile.height)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => setSheetOpen(true)}
        className="cursor-pointer"
      >
        <Card className="relative overflow-hidden bg-card p-5 sm:p-6">
          <div className="flex flex-col items-center gap-5">
            <div className="flex w-full justify-center rounded-[1.5rem] bg-inherit py-0.5">
              <video
                src="/images/huahuachi.mp4"
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                className="h-auto w-[150px] rounded-[1.5rem] bg-inherit mix-blend-multiply brightness-[1.02] dark:mix-blend-screen dark:brightness-[2.2] dark:contrast-[1.15] dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.12)] sm:w-[185px]"
              />
            </div>

            <div className="text-center">
              {latestEntry ? (
                <>
                  <div className="text-6xl font-black tracking-[-0.05em] text-foreground sm:text-7xl">
                    {formatWeight(latestEntry.weight, unit).split(" ")[0]}
                  </div>
                  <div className="mt-1.5 text-sm font-bold uppercase tracking-[0.24em] text-foreground/45">
                    {unit === "imperial" ? "lb" : "kg"}
                  </div>
                  {bmi && (
                    <div className="mt-4 inline-flex rounded-full bg-secondary px-4 py-1.5 text-sm font-bold">
                      {t.bmi} {bmi.toFixed(1)} · {bmiCategory?.label}
                    </div>
                  )}
                </>
              ) : (
                <div className="mx-auto max-w-[16rem] text-base font-bold text-foreground/60">
                  {t.tapToLog}
                </div>
              )}
            </div>

            <div className="w-[9.5rem] whitespace-nowrap rounded-full bg-success px-4 py-2.5 text-center text-sm font-black uppercase tracking-[0.12em] text-success-foreground [border:var(--neo-border)] [box-shadow:var(--neo-shadow)]">
              {latestEntry ? t.logWeight : t.getStarted}
            </div>
          </div>
        </Card>
      </motion.div>

      <WeightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
