// components/weight/WeightCard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/hamster/Hamster";
import { WeightSheet } from "@/components/weight/WeightSheet";
import { useStore } from "@/lib/store";
import { useHamsterExpression } from "@/hooks/useHamsterExpression";
import { formatWeight, calculateBMI, getBMICategory } from "@/lib/utils";

export function WeightCard() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const profile = useStore((s) => s.profile);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const latestEntry = getLatestEntry();
  const unit = profile?.unit ?? "metric";

  const bmi = latestEntry && profile?.height
    ? calculateBMI(latestEntry.weight, profile.height)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const expression = useHamsterExpression({
    context: justSaved ? "afterSave" : sheetOpen ? "weightInput" : "dashboard",
  });

  const handleSave = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setSheetOpen(true)}
        className="cursor-pointer"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-accent to-secondary/30 p-6">
          <div className="flex flex-col items-center gap-4">
            <Hamster expression={expression} size="xl" />

            <div className="text-center">
              {latestEntry ? (
                <>
                  <div className="text-4xl font-bold text-foreground">
                    {formatWeight(latestEntry.weight, unit).split(" ")[0]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {unit === "imperial" ? "lb" : "kg"}
                  </div>
                  {bmi && (
                    <div className="mt-2 text-lg font-medium text-foreground/80">
                      BMI {bmi.toFixed(1)} · {bmiCategory?.label}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-lg text-muted-foreground">
                  Tap to log your first weight!
                </div>
              )}
            </div>

            <div className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
              {latestEntry ? "Log Weight" : "Get Started"}
            </div>
          </div>
        </Card>
      </motion.div>

      <WeightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleSave}
      />
    </>
  );
}
