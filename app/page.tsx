// app/page.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { WeightCard } from "@/components/weight/WeightCard";
import { GoalProgressRing } from "@/components/dashboard/GoalProgressRing";
import { STREAK_MILESTONES } from "@/lib/constants";
import { getTranslations } from "@/lib/i18n";

const WeightSheet = dynamic(() => import("@/components/weight/WeightSheet").then(m => ({ default: m.WeightSheet })), { ssr: false });
const OnboardingFlow = dynamic(() => import("@/components/onboarding/OnboardingFlow").then(m => ({ default: m.OnboardingFlow })), { ssr: false });
const StreakCelebration = dynamic(() => import("@/components/celebration/StreakCelebration").then(m => ({ default: m.StreakCelebration })), { ssr: false });

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <WeightCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <GoalProgressRing />
        </motion.div>

        {/* Log Weight CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          whileTap={{ scale: 0.97, y: 2 }}
          onClick={() => setSheetOpen(true)}
          className="w-full rounded-full bg-primary py-4 text-center text-base font-black uppercase tracking-[0.12em] text-primary-foreground [border:var(--neo-border)] [box-shadow:var(--neo-shadow)] active:[box-shadow:0px_0px_0px_0px_transparent]"
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
