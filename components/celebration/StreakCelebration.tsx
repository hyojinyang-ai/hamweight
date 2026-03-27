// components/celebration/StreakCelebration.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hamster } from "@/components/hamster/Hamster";
import { STREAK_MILESTONES } from "@/lib/constants";

interface StreakCelebrationProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

const messages: Record<number, { title: string; subtitle: string }> = {
  3: { title: "3 Day Streak!", subtitle: "You're building a habit!" },
  7: { title: "1 Week Streak!", subtitle: "Incredible consistency!" },
  14: { title: "2 Week Streak!", subtitle: "You're unstoppable!" },
  30: { title: "30 Day Streak!", subtitle: "A whole month! Amazing!" },
  100: { title: "100 Day Streak!", subtitle: "You're a legend!" },
};

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
  const message = milestone ? messages[milestone] : null;

  if (!message) return null;

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
              className="flex flex-col items-center gap-4 rounded-3xl bg-card p-8 shadow-2xl"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Hamster expression="imTheBest" size="xl" />
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold tracking-tight">{message.title}</h2>
                <p className="mt-1 text-muted-foreground">{message.subtitle}</p>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold text-primary">{streak} days</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
