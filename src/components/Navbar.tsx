import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Volume2, VolumeX, BookOpen } from "lucide-react";
import { EASE, Magnetic } from "./ui";
import { sound } from "../lib/sound";
import { cn } from "../utils/cn";
import { LogoWordmark } from "./Logo";

const LINKS = [
  { label: "Engine", href: "#engine" },
  { label: "Method", href: "#method" },
  { label: "Simulator", href: "#simulator" },
  { label: "Signals", href: "#signals" },
];

export default function Navbar({
  onAudit,
  onOpenDocs,
  onBrandMark,
  brandFlying,
  started,
}: {
  onAudit: () => void;
  onOpenDocs: () => void;
  onBrandMark: (element: HTMLSpanElement | null) => void;
  brandFlying: boolean;
  started: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleAudio = () => {
    const next = sound.setEnabled(!soundEnabled);
    setSoundEnabled(next);
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.48, ease: EASE }}
      style={{ pointerEvents: started ? "auto" : "none" }}
      className={cn(
        "fixed inset-x-0 top-0 z-[100] transition-all duration-500",
        scrolled ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
        <a
          href="#top"
          data-hover
          onClick={() => sound.tick()}
          className="group flex items-center"
        >
          <LogoWordmark size={24} onMarkElement={onBrandMark} hideMark={brandFlying} />
        </a>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              data-hover
              onClick={() => sound.tick()}
              className="link-underline font-mono text-[11px] tracking-[0.14em] text-mute uppercase transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              sound.click();
              onOpenDocs();
            }}
            data-hover
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-lime uppercase transition-colors hover:text-bone"
          >
            <BookOpen className="h-3 w-3" />
            Engine Docs
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAudio}
            data-hover
            aria-label="Toggle sound"
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors",
              soundEnabled
                ? "border-lime bg-lime/10 text-lime"
                : "border-line bg-panel text-mute hover:border-line/80 hover:text-bone"
            )}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? "SFX" : "Muted"}</span>
          </button>

          <Magnetic strength={0.25}>
            <button
              onClick={() => {
                sound.click();
                onAudit();
              }}
              data-hover
              data-cursor="action"
              className="group flex items-center gap-2 rounded-full border border-line bg-panel px-5 py-2 font-mono text-[11px] tracking-[0.18em] text-bone uppercase transition-colors duration-300 hover:border-lime hover:bg-lime hover:text-ink"
            >
              Run audit
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </Magnetic>
        </div>
      </div>
    </motion.header>
  );
}
