// components/onboarding/OnboardingFlow.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Hamster } from "@/components/hamster/Hamster";
import { useStore } from "@/lib/store";
import { getTimeOfDay, cmToFtIn, ftInToCm } from "@/lib/utils";

type Step = "welcome" | "setup" | "firstWeight";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weight, setWeight] = useState("70");

  const setProfile = useStore((s) => s.setProfile);
  const addEntry = useStore((s) => s.addEntry);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const handleSetupNext = () => {
    const height =
      unit === "metric"
        ? parseFloat(heightCm)
        : ftInToCm(parseInt(heightFt), parseInt(heightIn));

    setProfile({
      height,
      unit,
      createdAt: new Date().toISOString(),
    });

    // Set default weight based on unit
    if (unit === "imperial") {
      setWeight("154"); // ~70kg
    }

    setStep("firstWeight");
  };

  const handleComplete = () => {
    const weightNum = parseFloat(weight);
    const weightKg = unit === "imperial" ? weightNum / 2.20462 : weightNum;

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay: getTimeOfDay(),
      exerciseContext: "none",
    });

    completeOnboarding();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-8 text-center">
              <Hamster expression="happy" size="xl" />
              <h1 className="mt-4 text-2xl font-bold">Hi! I&apos;m Ham!</h1>
              <p className="mt-2 text-muted-foreground">
                Welcome to HamWeight. Let&apos;s make tracking your weight simple
                and fun!
              </p>
              <Button onClick={() => setStep("setup")} className="mt-6 w-full">
                Get Started
              </Button>
            </Card>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-6">
              <div className="mb-6 text-center">
                <Hamster expression="cheerUp" size="lg" />
                <h2 className="mt-2 text-xl font-bold">Quick Setup</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Preferred Units</Label>
                  <Select
                    value={unit}
                    onValueChange={(v) => setUnit(v as "metric" | "imperial")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lb, ft/in)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Your Height</Label>
                  {unit === "metric" ? (
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">cm</span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Input
                        type="number"
                        value={heightFt}
                        onChange={(e) => setHeightFt(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">ft</span>
                      <Input
                        type="number"
                        value={heightIn}
                        onChange={(e) => setHeightIn(e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">in</span>
                    </div>
                  )}
                </div>

                <Button onClick={handleSetupNext} className="w-full">
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "firstWeight" && (
          <motion.div
            key="firstWeight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm"
          >
            <Card className="p-6">
              <div className="mb-6 text-center">
                <Hamster expression="measuringWeight" size="lg" />
                <h2 className="mt-2 text-xl font-bold">Let&apos;s start!</h2>
                <p className="text-sm text-muted-foreground">
                  What&apos;s your weight today?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-32 text-center text-2xl font-bold"
                    step="0.1"
                  />
                  <span className="text-lg text-muted-foreground">
                    {unit === "imperial" ? "lb" : "kg"}
                  </span>
                </div>

                <Button onClick={handleComplete} className="w-full">
                  Save & Begin
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
