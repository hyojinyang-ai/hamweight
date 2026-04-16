"use client";

import { motion } from "framer-motion";
import type { HamsterExpression, HamsterSize } from "@/lib/types";
import { HAMSTER_SIZES } from "@/lib/constants";

interface HamsterProps {
  expression?: HamsterExpression;
  size?: HamsterSize;
  animate?: boolean;
  className?: string;
}

export function Hamster({
  size = "md",
  animate = true,
  className,
}: HamsterProps) {
  const sizeValue = HAMSTER_SIZES[size];

  return (
    <motion.div
      style={{ width: sizeValue, height: sizeValue }}
      className={className}
      animate={animate ? { scale: [1, 1.03, 1] } : undefined}
      transition={animate ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <svg
        viewBox="0 0 200 200"
        width={sizeValue}
        height={sizeValue}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left ear - big pointy chihuahua ear */}
        <path
          d="M50 80 L28 18 L78 60 Z"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Left ear inner */}
        <path
          d="M50 72 L36 30 L70 58 Z"
          fill="hsl(var(--primary))"
          opacity="0.35"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Right ear - big pointy chihuahua ear */}
        <path
          d="M150 80 L172 18 L122 60 Z"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Right ear inner */}
        <path
          d="M150 72 L164 30 L130 58 Z"
          fill="hsl(var(--primary))"
          opacity="0.35"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Head - slightly taller, chihuahua apple-dome shape */}
        <ellipse
          cx="100" cy="100" rx="60" ry="56"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Face patch - lighter area */}
        <ellipse
          cx="100" cy="112" rx="38" ry="32"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />

        {/* Left eye - big round chihuahua eye */}
        <circle
          cx="78" cy="94" r="13"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="4"
        />
        {/* Left pupil */}
        <circle cx="80" cy="93" r="8" fill="hsl(var(--border))" />
        {/* Left eye highlight */}
        <circle cx="84" cy="89" r="3" fill="hsl(var(--card))" />

        {/* Right eye - big round chihuahua eye */}
        <circle
          cx="122" cy="94" r="13"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="4"
        />
        {/* Right pupil */}
        <circle cx="124" cy="93" r="8" fill="hsl(var(--border))" />
        {/* Right eye highlight */}
        <circle cx="128" cy="89" r="3" fill="hsl(var(--card))" />

        {/* Nose - small triangle-ish chihuahua nose */}
        <path
          d="M94 112 L100 106 L106 112 Z"
          fill="hsl(var(--border))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Mouth */}
        <path
          d="M100 112 L100 120"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M90 122 Q100 130 110 122"
          stroke="hsl(var(--border))"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Tongue - tiny blep */}
        <ellipse
          cx="100" cy="127" rx="5" ry="4"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />

        {/* Body - small chihuahua body */}
        <ellipse
          cx="100" cy="168" rx="36" ry="26"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Belly */}
        <ellipse
          cx="100" cy="172" rx="22" ry="16"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />

        {/* Left front paw */}
        <ellipse
          cx="76" cy="190" rx="12" ry="7"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="4"
        />

        {/* Right front paw */}
        <ellipse
          cx="124" cy="190" rx="12" ry="7"
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--border))"
          strokeWidth="4"
        />
      </svg>
    </motion.div>
  );
}
