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
  expression = "happy",
  size = "md",
  animate = true,
  className,
}: HamsterProps) {
  const sizeValue = HAMSTER_SIZES[size];

  return (
    <motion.svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 100 100"
      className={className}
      animate={animate ? { scale: [1, 1.02, 1] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {/* Body */}
      <motion.ellipse
        cx="50"
        cy="55"
        rx="35"
        ry="30"
        className="fill-primary"
      />

      {/* Belly */}
      <ellipse
        cx="50"
        cy="60"
        rx="25"
        ry="20"
        className="fill-secondary"
      />

      {/* Left Ear */}
      <circle cx="25" cy="30" r="12" className="fill-primary" />
      <circle cx="25" cy="30" r="7" className="fill-secondary" />

      {/* Right Ear */}
      <circle cx="75" cy="30" r="12" className="fill-primary" />
      <circle cx="75" cy="30" r="7" className="fill-secondary" />

      {/* Face */}
      <circle cx="50" cy="45" r="25" className="fill-primary" />

      {/* Cheeks */}
      <circle cx="30" cy="50" r="8" className="fill-secondary opacity-70" />
      <circle cx="70" cy="50" r="8" className="fill-secondary opacity-70" />

      {/* Eyes - varies by expression */}
      <HamsterEyes expression={expression} animate={animate} />

      {/* Nose */}
      <ellipse cx="50" cy="50" rx="4" ry="3" className="fill-foreground" />

      {/* Mouth - varies by expression */}
      <HamsterMouth expression={expression} />

      {/* Whiskers */}
      <g className="stroke-foreground/50" strokeWidth="1">
        <line x1="20" y1="48" x2="35" y2="50" />
        <line x1="20" y1="52" x2="35" y2="52" />
        <line x1="65" y1="50" x2="80" y2="48" />
        <line x1="65" y1="52" x2="80" y2="52" />
      </g>
    </motion.svg>
  );
}

function HamsterEyes({ expression, animate }: { expression: HamsterExpression; animate: boolean }) {
  const isSleepy = expression === "sleepy" || expression === "exhausted" || expression === "feelingTired";
  const isHappy = expression === "happy" || expression === "cheerUp" || expression === "imTheBest";

  if (isSleepy) {
    return (
      <>
        <line x1="38" y1="42" x2="46" y2="42" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
        <line x1="54" y1="42" x2="62" y2="42" className="stroke-foreground" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  if (isHappy) {
    return (
      <>
        <path d="M38 44 Q42 40 46 44" className="stroke-foreground fill-none" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 44 Q58 40 62 44" className="stroke-foreground fill-none" strokeWidth="2" strokeLinecap="round" />
      </>
    );
  }

  // Default open eyes
  return (
    <>
      <motion.circle
        cx="42"
        cy="42"
        r="4"
        className="fill-foreground"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? { duration: 0.2, repeat: Infinity, repeatDelay: 4 } : undefined}
      />
      <motion.circle
        cx="58"
        cy="42"
        r="4"
        className="fill-foreground"
        animate={animate ? { scaleY: [1, 0.1, 1] } : undefined}
        transition={animate ? { duration: 0.2, repeat: Infinity, repeatDelay: 4 } : undefined}
      />
      <circle cx="43" cy="41" r="1.5" className="fill-white" />
      <circle cx="59" cy="41" r="1.5" className="fill-white" />
    </>
  );
}

function HamsterMouth({ expression }: { expression: HamsterExpression }) {
  const isBig = expression === "imTheBest" || expression === "bringItOn";
  const isSmile = expression === "happy" || expression === "cheerUp" || expression === "youCanDoIt";

  if (isBig) {
    return (
      <path
        d="M42 55 Q50 65 58 55"
        className="stroke-foreground fill-none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  if (isSmile) {
    return (
      <path
        d="M44 54 Q50 59 56 54"
        className="stroke-foreground fill-none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  // Neutral mouth
  return (
    <path
      d="M46 55 Q50 57 54 55"
      className="stroke-foreground fill-none"
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}
