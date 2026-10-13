import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { sound } from "../lib/sound";

/**
 * Single minimal cursor: a white dot that grows when over something clickable.
 * Only active on precise pointers; mobile/touch renders nothing.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const prevHover = useRef(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const over = !!t?.closest?.("a, button, input, [role='button'], [data-hover]");
      setHovering(over);
      if (over && !prevHover.current) sound.hover();
      prevHover.current = over;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] hidden md:block">
      <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          animate={{ width: hovering ? 38 : 13, height: hovering ? 38 : 13 }}
          transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.5 }}
          style={{ boxShadow: "0 0 14px rgba(255,255,255,0.45)" }}
        />
      </motion.div>
    </div>
  );
}
