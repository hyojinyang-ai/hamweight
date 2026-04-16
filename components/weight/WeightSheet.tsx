// components/weight/WeightSheet.tsx
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { getTimeOfDay, kgToLb, lbToKg } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";
import type { WeightEntry, BodyMeasurements } from "@/lib/types";
import { Ruler, Sunrise, Sun, CloudSun, Moon, BedDouble, Dumbbell, PersonStanding } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  const latestEntry = getLatestEntry();
  const defaultWeight = latestEntry?.weight ?? 70;

  const [weight, setWeight] = useState<string>("");
  const [timeOfDay, setTimeOfDay] = useState<WeightEntry["timeOfDay"]>(getTimeOfDay());
  const [exerciseContext, setExerciseContext] = useState<WeightEntry["exerciseContext"]>("none");
  const [showOptions, setShowOptions] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<BodyMeasurements>({});

  useEffect(() => {
    if (open) {
      const displayWeight = unit === "imperial" ? kgToLb(defaultWeight) : defaultWeight;
      setWeight(displayWeight.toFixed(1));
      setTimeOfDay(getTimeOfDay());
      setExerciseContext("none");
      setShowOptions(false);
      setShowMeasurements(false);
      setMeasurements({});
    }
  }, [open, defaultWeight, unit]);

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const weightKg = unit === "imperial" ? lbToKg(weightNum) : weightNum;

    const hasMeasurements = Object.values(measurements).some((v) => v && v > 0);

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay,
      exerciseContext,
      ...(hasMeasurements && { measurements }),
    });

    onOpenChange(false);
    onSave?.();
  };

  const updateMeasurement = (key: keyof BodyMeasurements, value: string) => {
    const num = parseFloat(value);
    setMeasurements((prev) => ({
      ...prev,
      [key]: isNaN(num) ? undefined : num,
    }));
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const step = unit === "imperial" ? 0.2 : 0.1;
    setWeight((current + delta * step).toFixed(1));
  };

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

  const measurementFields: { key: keyof BodyMeasurements; labelKey: "waist" | "hips" | "chest" | "arms" | "thighs" }[] = [
    { key: "waist", labelKey: "waist" },
    { key: "hips", labelKey: "hips" },
    { key: "chest", labelKey: "chest" },
    { key: "arms", labelKey: "arms" },
    { key: "thighs", labelKey: "thighs" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-center">
          <SheetTitle>{t.logYourWeight}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Weight Input */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full text-xl"
              onClick={() => adjustWeight(-1)}
            >
              −
            </Button>
            <div className="text-center">
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-16 w-32 text-center text-3xl font-bold"
                step="0.1"
              />
              <span className="text-sm text-muted-foreground">
                {unit === "imperial" ? "lb" : "kg"}
              </span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full text-xl"
              onClick={() => adjustWeight(1)}
            >
              +
            </Button>
          </div>

          {/* Smart Defaults Display */}
          <div className="rounded-xl bg-muted p-3 text-center text-sm font-medium [border:var(--neo-border)]">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              {(() => { const TimeIcon = timeOptions.find((o) => o.value === timeOfDay)?.icon; return TimeIcon ? <TimeIcon className="inline h-3.5 w-3.5" /> : null; })()}
              {t[timeOptions.find((o) => o.value === timeOfDay)?.labelKey ?? "morning"]} ·{" "}
              {(() => { const ExIcon = exerciseOptions.find((o) => o.value === exerciseContext)?.icon; return ExIcon ? <ExIcon className="inline h-3.5 w-3.5" /> : null; })()}
              {t[exerciseOptions.find((o) => o.value === exerciseContext)?.labelKey ?? "noExercise"]}
            </span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="ml-2 text-primary underline"
            >
              {showOptions ? t.hide : t.change}
            </button>
          </div>

          {/* Options (collapsed by default) */}
          {showOptions && (
            <div className="space-y-4">
              <div>
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
              </div>

              <div>
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
              </div>
            </div>
          )}

          {/* Body Measurements (optional) */}
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-[2.5px] border-dashed border-foreground/20 p-3 text-sm font-bold text-foreground/50 transition-colors hover:border-primary hover:text-primary"
          >
            <Ruler className="h-4 w-4" />
            {showMeasurements ? t.hideBodyMeasurements : t.addBodyMeasurements}
          </button>

          {showMeasurements && (
            <div className="grid grid-cols-2 gap-3">
              {measurementFields.map(({ key, labelKey }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{t[labelKey]}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      placeholder="—"
                      value={measurements[key] ?? ""}
                      onChange={(e) => updateMeasurement(key, e.target.value)}
                      className="h-9"
                      step="0.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      {unit === "imperial" ? "in" : "cm"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" size="lg">
            {t.save}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
