// components/onboarding/OnboardingFlow.tsx
"use client";

import { useEffect, useState } from "react";
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

type Step = "welcome" | "setup" | "firstWeight";

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>("welcome");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [lang, setLang] = useState<Locale>("en");
  const [heightCm, setHeightCm] = useState("170");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weight, setWeight] = useState("70");

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
            <Card className="bg-secondary p-8 text-center">
              <h1 className="text-3xl font-black">{t.welcome}</h1>
              <p className="mt-2 font-medium text-foreground/60">
                {t.welcomeDesc}
              </p>
              <Button onClick={() => setStep("setup")} className="mt-6 w-full" size="lg">
                {t.getStarted}
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
                  <Label>{t.yourHeight}</Label>
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
              <div className="mb-6 text-center">
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
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-32 text-center text-2xl font-bold"
                    step="0.1"
                  />
                  <span className="text-lg text-muted-foreground">
                    {unit === "imperial" ? "lb" : "kg"}
                  </span>
                </div>

                <Button onClick={handleComplete} className="w-full">
                  {t.saveBegin}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
