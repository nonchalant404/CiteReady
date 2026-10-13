import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { EASE } from "./ui";
import { LogoMark } from "./Logo";
import { sound } from "../lib/sound";
import { isLowPowerDevice } from "../lib/performance";

const ENGINES = ["GPT", "PPLX", "GEM", "CLD"];

export default function Preloader({
  onReveal,
  onExited,
}: {
  onReveal: (logoRect: DOMRect) => void;
  onExited: () => void;
}) {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [handingOff, setHandingOff] = useState(false);
  const [hoverLogo, setHoverLogo] = useState(false);
  const logoRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number>(0);
  const handoffTimerRef = useRef<number>(0);
  const setLogoElement = useCallback((element: HTMLSpanElement | null) => {
    logoRef.current = element;
  }, []);
  const lowPower = isLowPowerDevice();
  const logoSize = lowPower ? 132 : 176;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 78, damping: 18, mass: 0.48 });
  const sy = useSpring(my, { stiffness: 78, damping: 18, mass: 0.48 });
  const rotY = useTransform(sx, [-1, 1], [-11, 11]);
  const rotX = useTransform(sy, [-1, 1], [9, -9]);
  const parX = useTransform(sx, [-1, 1], [-13, 13]);
  const parY = useTransform(sy, [-1, 1], [-13, 13]);

  useEffect(() => {
    let value = 0;
    const tick = () => {
      value += Math.max(2, Math.round((100 - value) * (lowPower ? 0.16 : 0.13)));
      if (value >= 100) {
        setCount(100);
        handoffTimerRef.current = window.setTimeout(() => {
          const rect = logoRef.current?.getBoundingClientRect();
          if (rect) {
            setHandingOff(true);
            onReveal(rect);
          }
          setExiting(true);
        }, 320);
        return;
      }
      setCount(value);
      timerRef.current = window.setTimeout(tick, lowPower ? 86 : 68);
    };

    timerRef.current = window.setTimeout(tick, 100);
    return () => {
      window.clearTimeout(timerRef.current);
      window.clearTimeout(handoffTimerRef.current);
    };
  }, [lowPower, onReveal]);

  useEffect(() => {
    if (lowPower) return;
    const onMove = (event: MouseEvent) => {
      mx.set((event.clientX - window.innerWidth / 2) / (window.innerWidth / 2));
      my.set((event.clientY - window.innerHeight / 2) / (window.innerHeight / 2));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [lowPower, mx, my]);

  return (
    <AnimatePresence onExitComplete={onExited}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[150] overflow-hidden bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: lowPower ? 0.58 : 0.72, ease: EASE }}
        >
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
          <div className="noise pointer-events-none absolute inset-0" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6 font-mono text-[10px] tracking-[0.3em] text-mute uppercase md:px-10">
            <span>CiteReady®</span>
            <span className="text-lime">GEO ENGINE · LIVE</span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: handingOff ? 0 : 1, y: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mb-8 flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-dim uppercase"
            >
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-lime" />
              Initializing citation index
            </motion.span>

            <div className="relative flex items-center justify-center" style={{ perspective: lowPower ? undefined : 900 }}>
              <motion.div
                aria-hidden
                className="absolute rounded-full border border-dashed border-lime/25"
                style={{ width: logoSize + 48, height: logoSize + 48 }}
                animate={lowPower ? undefined : { rotate: 360 }}
                transition={lowPower ? undefined : { duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute rounded-full border border-line" style={{ width: logoSize + 78, height: logoSize + 78 }} />

              <motion.div
                style={lowPower ? undefined : { x: parX, y: parY, rotateX: rotX, rotateY: rotY }}
                className="relative z-10"
                onHoverStart={() => {
                  if (lowPower) return;
                  setHoverLogo(true);
                  sound.hover();
                }}
                onHoverEnd={() => setHoverLogo(false)}
              >
                <motion.div
                  animate={{ scale: handingOff ? 1 : hoverLogo ? 1.075 : 1, rotate: hoverLogo ? 2 : 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.55 }}
                >
                  <LogoMark
                    size={logoSize}
                    onElement={setLogoElement}
                    hidden={handingOff}
                    className="block"
                  />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: handingOff ? 0 : 1, y: handingOff ? -8 : 0 }}
              transition={{ duration: 0.34, ease: EASE }}
              className="mt-9 font-arch font-expanded text-[12vw] font-bold uppercase leading-none tracking-tight text-bone md:text-[6rem]"
            >
              Cite<span className="font-serif font-normal italic lowercase text-lime">Ready</span>
            </motion.div>

            <motion.div
              animate={{ opacity: handingOff ? 0 : 1, y: handingOff ? -4 : 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mt-7 flex items-center gap-3"
            >
              {ENGINES.map((engine, index) => (
                <motion.span
                  key={engine}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: handingOff ? 0 : 1, y: handingOff ? -3 : 0 }}
                  transition={{ duration: 0.32, delay: handingOff ? 0 : 0.2 + index * 0.09, ease: EASE }}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[9px] tracking-[0.18em] text-mute"
                >
                  {engine}
                </motion.span>
              ))}
            </motion.div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-6 pb-8 md:px-10">
            <span className="font-mono text-[9px] tracking-[0.24em] text-dim uppercase sm:text-[10px]">
              Visibility for the answer era
            </span>
            <div className="font-arch font-expanded text-[18vw] leading-[0.8] font-bold tracking-tight text-bone tabular-nums md:text-[8rem]">
              {count}<span className="text-lime">%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}