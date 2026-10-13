import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Magnetic, Reveal, SplitText } from "./ui";
import { sound } from "../lib/sound";

export default function CTA({ onAudit }: { onAudit: () => void }) {
  return (
    <section id="audit" className="relative overflow-hidden px-5 py-32 md:px-10 md:py-48">
      {/* ghost word cropped off the bottom-right corner */}
      <div aria-hidden className="pointer-events-none absolute -bottom-[5vw] -right-[3vw] select-none">
        <span className="block font-arch font-expanded text-[30vw] font-bold uppercase leading-none tracking-tight text-stroke opacity-[0.07]">
          CITED
        </span>
      </div>
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[720px] rounded-full bg-lime/[0.06] blur-[130px]" />

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-12 items-end gap-x-8 gap-y-16">
        <div className="col-span-12 lg:col-span-8">
          <Reveal y={16}>
            <p className="mb-8 flex items-center gap-3 font-mono text-[12px] tracking-[0.28em] text-mute uppercase">
              <span className="h-px w-10 bg-lime" />
              05 — Your Move
            </p>
          </Reveal>

          <h2 className="font-arch font-expanded font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-bone">
            <span className="block text-[clamp(3.4rem,12vw,12rem)]">
              <SplitText text="GET" stagger={0.05} mode="view" />
            </span>
            <span className="block font-serif normal-case italic tracking-normal text-lime text-[clamp(3.4rem,12vw,12rem)] md:pl-[14%]">
              <SplitText text="cited." stagger={0.05} mode="view" />
            </span>
          </h2>

          <Reveal delay={0.25} className="mt-10 max-w-md">
            <p className="text-lg leading-relaxed text-mute">
              One URL. Forty signals. Find out if answer engines quote you — or skip you entirely.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 flex lg:col-span-4 lg:justify-end">
          <Reveal delay={0.35}>
            <Magnetic strength={0.45}>
              <button
                onClick={() => {
                  sound.click();
                  onAudit();
                }}
                data-hover
                className="group relative flex h-44 w-44 items-center justify-center md:h-56 md:w-56"
                aria-label="Run free audit"
              >
                <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
                  <defs>
                    <path id="cta-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                  </defs>
                  <text className="fill-bone font-mono text-[7.6px] tracking-[0.2em] uppercase">
                    <textPath href="#cta-circle">Run free audit — No signup — Run free audit —</textPath>
                  </text>
                </motion.svg>
                <span className="flex h-28 w-28 items-center justify-center rounded-full border border-lime/40 bg-lime/10 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-lime md:h-32 md:w-32">
                  <ArrowUpRight className="h-8 w-8 text-lime transition-all duration-500 group-hover:rotate-45 group-hover:text-ink" strokeWidth={1.5} />
                </span>
              </button>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
