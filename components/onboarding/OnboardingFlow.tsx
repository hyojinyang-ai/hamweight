// components/onboarding/OnboardingFlow.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { useStore } from "@/lib/store";
import { getTimeOfDay, ftInToCm } from "@/lib/utils";
import { getTranslations, type Locale } from "@/lib/i18n";
import type { UserProfile } from "@/lib/types";
import { Check } from "lucide-react";

type Step = "welcome" | "setup" | "firstWeight";

const TOTAL_STEPS = 3;

function StepIndicator({ current, total, lang }: { current: number; total: number; lang: Locale }) {
  const t = getTranslations(lang);
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-xs font-bold text-foreground/40">{t.stepOf(current, total)}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < current ? "w-6 bg-primary" : "w-1.5 bg-foreground/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [lang, setLang] = useState<Locale>("en");
  const [heightCm, setHeightCm] = useState("170");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weight, setWeight] = useState("70");
  const [weightError, setWeightError] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const setProfile = useStore((s) => s.setProfile);
  const addEntry = useStore((s) => s.addEntry);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const t = getTranslations(lang);

  const buildDraftProfile = (
    overrides: Partial<Pick<UserProfile, "language" | "unit">> = {}
  ): UserProfile => {
    const nextUnit = overrides.unit ?? unit;
    const nextLanguage = overrides.language ?? lang;
    const height =
      nextUnit === "metric"
        ? parseFloat(heightCm) || 170
        : ftInToCm(parseInt(heightFt) || 5, parseInt(heightIn) || 7);

    return {
      height,
      unit: nextUnit,
      language: nextLanguage,
      createdAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLanguageChange = (nextLang: Locale) => {
    setLang(nextLang);
    setProfile(buildDraftProfile({ language: nextLang }));
  };

  const handleUnitChange = (nextUnit: "metric" | "imperial") => {
    setUnit(nextUnit);
    setProfile(buildDraftProfile({ unit: nextUnit }));
  };

  const handleSetupNext = () => {
    setProfile(buildDraftProfile());

    if (unit === "imperial") {
      setWeight("154");
    }

    setStep("firstWeight");
  };

  const handleComplete = () => {
    const weightNum = parseFloat(weight);
    const maxWeight = unit === "imperial" ? 660 : 300;

    if (isNaN(weightNum) || weightNum <= 0) {
      setWeightError(t.invalidWeight);
      return;
    }
    if (weightNum > maxWeight) {
      setWeightError(t.weightTooHigh);
      return;
    }

    const weightKg = unit === "imperial" ? weightNum / 2.20462 : weightNum;

    addEntry({
      weight: weightKg,
      timestamp: new Date().toISOString(),
      timeOfDay: getTimeOfDay(),
      exerciseContext: "none",
    });

    setShowComplete(true);
    setTimeout(() => {
      completeOnboarding();
    }, 1600);
  };

  const handleWeightInput = (value: string) => {
    setWeight(value);
    if (weightError) setWeightError(null);
  };

  const currentStepNum = step === "welcome" ? 1 : step === "setup" ? 2 : 3;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {showComplete ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success [border:var(--neo-border)] [box-shadow:var(--neo-shadow)]"
            >
              <Check className="h-10 w-10 text-success-foreground" strokeWidth={3} />
            </motion.div>
            <h2 className="text-2xl font-black">{t.onboardingComplete}</h2>
            <p className="mt-2 text-sm font-bold text-foreground/50">{t.whatToExpect}</p>
          </motion.div>
        ) : (
          <>
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-sm"
              >
                <Card className="overflow-hidden p-0">
                  <div className="overflow-hidden">
                    <Image
                      src="/images/myweight-hero.png"
                      alt="MyWeight"
                      width={800}
                      height={400}
                      className="w-full object-cover"
                      priority
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-black">{t.welcome}</h1>
                    <p className="mt-3 text-sm font-medium leading-relaxed text-foreground/60">
                      {t.welcomeDesc}
                    </p>
                    <Button onClick={() => setStep("setup")} className="mt-6 w-full" size="lg">
                      {t.getStarted}
                    </Button>
                  </div>
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
                  <div className="mb-6 space-y-3 text-center">
                    <StepIndicator current={currentStepNum} total={TOTAL_STEPS} lang={lang} />
                    <h2 className="text-xl font-black">{t.quickSetup}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>{t.language}</Label>
                      <Select
                        value={lang}
                        onValueChange={(v) => handleLanguageChange(v as Locale)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t.preferredUnits}</Label>
                      <Select
                        value={unit}
                        onValueChange={(v) => handleUnitChange(v as "metric" | "imperial")}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">{t.metricUnits}</SelectItem>
                          <SelectItem value="imperial">{t.imperialUnits}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between">
                        <Label>{t.yourHeight}</Label>
                        <span className="text-[11px] font-bold text-foreground/35">{t.heightWhy}</span>
                      </div>
                      {unit === "metric" ? (
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value)}
                            className="flex-1"
                            inputMode="numeric"
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
                            inputMode="numeric"
                          />
                          <span className="text-sm text-muted-foreground">ft</span>
                          <Input
                            type="number"
                            value={heightIn}
                            onChange={(e) => setHeightIn(e.target.value)}
                            className="w-20"
                            inputMode="numeric"
                          />
                          <span className="text-sm text-muted-foreground">in</span>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleSetupNext} className="w-full">
                      {t.continue}
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
                  <div className="mb-6 space-y-3 text-center">
                    <StepIndicator current={currentStepNum} total={TOTAL_STEPS} lang={lang} />
                    <h2 className="text-xl font-black">{t.letsStart}</h2>
                    <p className="text-sm font-medium text-foreground/60">
                      {t.whatsYourWeight}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => handleWeightInput(e.target.value)}
                        className={`w-32 text-center text-2xl font-bold ${weightError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        step="0.1"
                        inputMode="decimal"
                      />
                      <span className="text-lg text-muted-foreground">
                        {unit === "imperial" ? "lb" : "kg"}
                      </span>
                    </div>

                    <AnimatePresence>
                      {weightError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-center text-sm font-bold text-destructive"
                        >
                          {weightError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-center text-xs font-bold text-foreground/35">
                      {t.firstWeightHint}
                    </p>

                    <Button onClick={handleComplete} className="w-full">
                      {t.saveBegin}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
