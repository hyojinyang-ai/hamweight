// components/weight/WeightSheet.tsx
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { getTimeOfDay, kgToLb, lbToKg } from "@/lib/utils";
import type { WeightEntry, BodyMeasurements } from "@/lib/types";
import { Ruler } from "lucide-react";

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

    // Only include measurements if any are filled
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

  const timeOptions: { value: WeightEntry["timeOfDay"]; label: string; emoji: string }[] = [
    { value: "morning", label: "Morning", emoji: "🌅" },
    { value: "lunch", label: "Lunch", emoji: "🌞" },
    { value: "afternoon", label: "Afternoon", emoji: "🌤️" },
    { value: "evening", label: "Evening", emoji: "🌙" },
  ];

  const exerciseOptions: { value: WeightEntry["exerciseContext"]; label: string; emoji: string }[] = [
    { value: "none", label: "No exercise", emoji: "😴" },
    { value: "before", label: "Before workout", emoji: "💪" },
    { value: "after", label: "After workout", emoji: "🏃" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-center">
          <div className="flex justify-center py-2">
            <Hamster expression="measuringWeight" size="lg" />
          </div>
          <SheetTitle>Log your weight</SheetTitle>
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
          <div className="rounded-lg bg-muted p-3 text-center text-sm">
            <span className="text-muted-foreground">
              {timeOptions.find((t) => t.value === timeOfDay)?.emoji}{" "}
              {timeOptions.find((t) => t.value === timeOfDay)?.label} ·{" "}
              {exerciseOptions.find((e) => e.value === exerciseContext)?.emoji}{" "}
              {exerciseOptions.find((e) => e.value === exerciseContext)?.label}
            </span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="ml-2 text-primary underline"
            >
              {showOptions ? "Hide" : "Change"}
            </button>
          </div>

          {/* Options (collapsed by default) */}
          {showOptions && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Time of day</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {timeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={timeOfDay === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeOfDay(option.value)}
                    >
                      {option.emoji} {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Exercise</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exerciseOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={exerciseContext === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExerciseContext(option.value)}
                    >
                      {option.emoji} {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Body Measurements (optional) */}
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/30 p-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Ruler className="h-4 w-4" />
            {showMeasurements ? "Hide" : "Add"} body measurements
          </button>

          {showMeasurements && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "waist" as const, label: "Waist" },
                { key: "hips" as const, label: "Hips" },
                { key: "chest" as const, label: "Chest" },
                { key: "arms" as const, label: "Arms" },
                { key: "thighs" as const, label: "Thighs" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground">{label}</Label>
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
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
