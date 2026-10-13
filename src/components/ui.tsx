import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useInView, animate } from "motion/react";
import { cn } from "../utils/cn";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------- SplitText: per-char reveal ---------------- */

export function SplitText({
  text,
  className,
  charClassName,
  delay = 0,
  stagger = 0.028,
  as: Tag = "span",
  mode = "mount",
}: {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div";
  mode?: "mount" | "view";
}) {
  const words = text.split(" ");
  let charIndex = 0;
  const MTag = motion[Tag as "span"];

  return (
    <MTag className={cn("inline-block", className)} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {word.split("").map((char, ci) => {
            const i = charIndex++;
            return (
              <span key={ci} className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
                <motion.span
                  className={cn("inline-block will-change-transform", charClassName)}
                  initial={{ y: "118%", rotate: 4 }}
                  {...(mode === "view"
                    ? {
                        whileInView: { y: "0%", rotate: 0 },
                        viewport: { once: true, margin: "-8% 0px" },
                      }
                    : { animate: { y: "0%", rotate: 0 } })}
                  transition={{ duration: 1, ease: EASE, delay: mode === "view" ? 0 : delay + i * stagger }}
                >
                  {char}
                </motion.span>
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MTag>
  );
}

/* ---------------- FadeUp: generic reveal on view ---------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Magnetic wrapper ---------------- */

export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- CountUp ---------------- */

export function CountUp({
  to,
  decimals = 0,
  duration = 2,
  className,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------- Kicker: mono section label ---------------- */

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Reveal y={16}>
      <div className={cn("flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] text-mute uppercase", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
        {children}
      </div>
    </Reveal>
  );
}
