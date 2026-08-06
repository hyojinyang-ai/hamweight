// app/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { WeightCard } from "@/components/weight/WeightCard";
import { WeightSheet } from "@/components/weight/WeightSheet";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { StreakCelebration } from "@/components/celebration/StreakCelebration";
import { GoalProgressRing } from "@/components/dashboard/GoalProgressRing";
import { STREAK_MILESTONES } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n";

export default function Home() {
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const streak = useStore((s) => s.streak);
  const profile = useStore((s) => s.profile);
  const entries = useStore((s) => s.entries);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const prevStreakRef = useRef(streak);

  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);
  const hasEntries = entries.length > 0;

  useEffect(() => {
    const isMilestone = STREAK_MILESTONES.includes(streak as typeof STREAK_MILESTONES[number]);
    const streakIncreased = streak > prevStreakRef.current;

    if (isMilestone && streakIncreased) {
      setShowCelebration(true);
    }

    prevStreakRef.current = streak;
  }, [streak]);

  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <>
      <div className="mx-auto max-w-md space-y-4 px-4 py-6">
        {/* Hero Image */}
        <div className="overflow-hidden rounded-[1.4rem] [border:var(--neo-border)] [box-shadow:var(--neo-shadow)]">
          <Image
            src="/images/myweight-hero.png"
            alt="My Weight"
            width={800}
            height={400}
            className="w-full object-cover"
            priority
          />
        </div>

        <WeightCard />
        <GoalProgressRing />

        {/* Log Weight CTA Button */}
        <motion.button
          whileTap={{ scale: 0.97, y: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setSheetOpen(true)}
          className="w-full rounded-full bg-success py-4 text-center text-base font-black uppercase tracking-[0.12em] text-success-foreground [border:var(--neo-border)] [box-shadow:var(--neo-shadow)] active:[box-shadow:0px_0px_0px_0px_transparent]"
        >
          {hasEntries ? t.logWeight : t.getStarted}
        </motion.button>
      </div>

      <WeightSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <StreakCelebration
        streak={streak}
        show={showCelebration}
        onClose={handleCloseCelebration}
      />
    </>
  );
}
