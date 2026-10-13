import { motion } from "motion/react";
import { LogoMark } from "./Logo";
import { EASE } from "./ui";

export interface BrandPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A lightweight, measured logo handoff from the opening to the navbar. */
export default function BrandFlight({
  from,
  to,
  onComplete,
}: {
  from: BrandPosition;
  to: BrandPosition;
  onComplete: () => void;
}) {
  const compact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 0.18 : compact ? 0.62 : 0.74;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[160] flex items-center justify-center text-bone"
      style={{ width: from.width, height: from.height }}
      initial={{ x: from.left, y: from.top }}
      animate={{ x: to.left, y: to.top, width: to.width, height: to.height }}
      transition={{ duration, ease: EASE }}
      onAnimationComplete={onComplete}
    >
      <LogoMark size="100%" className="block" />
    </motion.div>
  );
}