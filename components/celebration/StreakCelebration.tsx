// components/celebration/StreakCelebration.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STREAK_MILESTONES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { getTranslations } from "@/lib/i18n";
import { Flame } from "lucide-react";

interface StreakCelebrationProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

function Particle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#f08c70", "#fdd9b5", "#ff6b6b", "#ffd93d", "#6bcb77"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        backgroundColor: color,
        left: `${x}%`,
        top: "50%",
      }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -150 - Math.random() * 100],
        x: [0, (Math.random() - 0.5) * 100],
        scale: [1, 1.2, 0.5],
        rotate: [0, Math.random() * 360],
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export function StreakCelebration({ streak, show, onClose }: StreakCelebrationProps) {
  const [particles, setParticles] = useState<{ id: number; delay: number; x: number }[]>([]);
  const profile = useStore((s) => s.profile);
  const lang = profile?.language ?? "en";
  const t = getTranslations(lang);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.3,
        x: Math.random() * 100,
      }));
      setParticles(newParticles);

      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const milestone = STREAK_MILESTONES.find((m) => m === streak);
  if (!milestone) return null;

  const title = t.streakTitle(streak);
  const subtitle = t.streakSubtitle(streak);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="relative">
            {particles.map((p) => (
              <Particle key={p.id} delay={p.delay} x={p.x} />
            ))}

            <motion.div
              className="flex flex-col items-center gap-4 rounded-xl bg-secondary p-8 [border:var(--neo-border)] [box-shadow:var(--neo-shadow-lg)]"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                <p className="mt-1 font-bold text-foreground/60">{subtitle}</p>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 rounded-xl bg-card px-4 py-2 [border:var(--neo-border)] [box-shadow:var(--neo-shadow-sm)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Flame className="h-6 w-6 text-primary" strokeWidth={2.5} />
                <span className="text-xl font-bold text-primary">{streak} {t.days}</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
