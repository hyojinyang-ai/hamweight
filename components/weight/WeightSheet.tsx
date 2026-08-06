// components/weight/WeightSheet.tsx
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeightChangeBadge } from "@/components/weight/WeightChangeBadge";
import { useStore } from "@/lib/store";
import { getTimeOfDay, kgToLb, lbToKg, formatWeight } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import type { WeightEntry } from "@/lib/types";
import { Sunrise, Sun, CloudSun, Moon, BedDouble, Dumbbell, PersonStanding, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WEIGHT_MAX_KG = 300;
const WEIGHT_MAX_LB = 660;
const WEIGHT_MIN = 0.1;

interface WeightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function WeightSheet({ open, onOpenChange, onSave }: WeightSheetProps) {
  const profile = useStore((s) => s.profile);
  const addEntry = useStore((s) => s.addEntry);
  const getLatestEntry = useStore((s) => s.getLatestEntry);

  const unit = profile?.unit ?? "metric";
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
  const displayUnit = unit === "imperial" ? "lb" : "kg";
  const latestEntry = getLatestEntry();
  const defaultWeight = latestEntry?.weight ?? 0;

  const [weight, setWeight] = useState<string>("");
  const [timeOfDay, setTimeOfDay] = useState<WeightEntry["timeOfDay"]>(getTimeOfDay());
  const [exerciseContext, setExerciseContext] = useState<WeightEntry["exerciseContext"]>("none");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const previewWeightNum = parseFloat(weight);
  const previewWeightKg = !isNaN(previewWeightNum) && previewWeightNum > 0
    ? unit === "imperial" ? lbToKg(previewWeightNum) : previewWeightNum
    : null;
  const previewChange = latestEntry && previewWeightKg !== null
    ? previewWeightKg - latestEntry.weight
    : null;

  const maxWeight = unit === "imperial" ? WEIGHT_MAX_LB : WEIGHT_MAX_KG;

  useEffect(() => {
    if (open) {
      const displayWeight = unit === "imperial" ? kgToLb(defaultWeight) : defaultWeight;
      setWeight(displayWeight.toFixed(1));
      setTimeOfDay(getTimeOfDay());
      setExerciseContext("none");
      setError(null);
      setSaving(false);
    }
  }, [open, defaultWeight, unit]);

  const validate = (value: string): string | null => {
    const num = parseFloat(value);
    if (isNaN(num) || num < WEIGHT_MIN) return t.invalidWeight;
    if (num > maxWeight) return t.weightTooHigh;
    return null;
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    if (error) setError(validate(value));
  };

  const handleSave = () => {
    const validationError = validate(weight);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    const weightNum = parseFloat(weight);
    const weightKg = unit === "imperial" ? lbToKg(weightNum) : weightNum;

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay,
      exerciseContext,
    });

    const savedDisplay = formatWeight(weightKg, unit);
    setToastMessage(t.weightSaved(savedDisplay));

    onOpenChange(false);
    onSave?.();
    setSaving(false);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const step = unit === "imperial" ? 0.2 : 0.1;
    const next = Math.max(WEIGHT_MIN, Math.min(maxWeight, current + delta * step));
    setWeight(next.toFixed(1));
    setError(null);
  };

  const isValid = !validate(weight);

  const timeOptions: { value: WeightEntry["timeOfDay"]; labelKey: "morning" | "lunch" | "afternoon" | "evening"; icon: LucideIcon }[] = [
    { value: "morning", labelKey: "morning", icon: Sunrise },
    { value: "lunch", labelKey: "lunch", icon: Sun },
    { value: "afternoon", labelKey: "afternoon", icon: CloudSun },
    { value: "evening", labelKey: "evening", icon: Moon },
  ];

  const exerciseOptions: { value: WeightEntry["exerciseContext"]; labelKey: "noExercise" | "beforeWorkout" | "afterWorkout"; icon: LucideIcon }[] = [
    { value: "none", labelKey: "noExercise", icon: BedDouble },
    { value: "before", labelKey: "beforeWorkout", icon: Dumbbell },
    { value: "after", labelKey: "afterWorkout", icon: PersonStanding },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl">
          <SheetHeader className="text-center">
            <SheetTitle>{t.logYourWeight} ({displayUnit})</SheetTitle>
          </SheetHeader>

          <div className="space-y-5 py-4">
            {/* Weight Input */}
            <section className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-2xl text-3xl font-black touch-manipulation"
                  onClick={() => adjustWeight(-1)}
                >
                  −
                </Button>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className={`h-16 w-36 text-center text-3xl font-black ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  step="0.1"
                  min={WEIGHT_MIN}
                  max={maxWeight}
                  inputMode="decimal"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-2xl text-3xl font-black touch-manipulation"
                  onClick={() => adjustWeight(1)}
                >
                  +
                </Button>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-center text-sm font-bold text-destructive"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-center text-center">
                <WeightChangeBadge
                  deltaKg={previewChange}
                  unit={unit}
                  language={lang}
                  showContext
                  variant="plain"
                  className="justify-center text-sm"
                />
              </div>
            </section>

            {/* Time of day */}
            <section className="border-t-[2.5px] border-foreground/15 pt-5">
              <Label className="text-sm text-muted-foreground">{t.timeOfDay}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {timeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={timeOfDay === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeOfDay(option.value)}
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" /> {t[option.labelKey]}
                    </Button>
                  );
                })}
              </div>
            </section>

            {/* Exercise */}
            <section className="border-t-[2.5px] border-foreground/15 pt-5">
              <Label className="text-sm text-muted-foreground">{t.exercise}</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {exerciseOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={exerciseContext === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExerciseContext(option.value)}
                    >
                      <Icon className="mr-1 h-3.5 w-3.5" /> {t[option.labelKey]}
                    </Button>
                  );
                })}
              </div>
            </section>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full"
              size="lg"
              disabled={!isValid || saving}
            >
              {t.save}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Save confirmation toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-2.5 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background">
              <Check className="h-4 w-4" />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
