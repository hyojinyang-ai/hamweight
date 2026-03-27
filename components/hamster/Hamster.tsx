"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
    <motion.div
      style={{ width: sizeValue, height: sizeValue }}
      className={className}
      animate={animate ? { scale: [1, 1.02, 1] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <Image
        src="/images/hamster.png"
        alt="Hamster"
        width={sizeValue}
        height={sizeValue}
        className="object-contain"
        priority
      />
    </motion.div>
  );
}
