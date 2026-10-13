import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Globe, ScanSearch } from "lucide-react";
import { EASE, Magnetic, SplitText } from "./ui";
import ParticleField from "./ParticleField";
import { EXAMPLE_URLS, normalizeUrl } from "../lib/analyze";
import { sound } from "../lib/sound";

function useTypedPlaceholder(enabled: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let i = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = EXAMPLE_URLS[i % EXAMPLE_URLS.length];
      if (!deleting) {
        char++;
        setText(current.slice(0, char));
        if (char >= current.length) {
          deleting = true;
          timer = setTimeout(tick, 2200);
          return;
        }
        timer = setTimeout(tick, 34 + Math.random() * 40);
      } else {
        char -= 3;
        if (char <= 0) {
          char = 0;
          deleting = false;
          i++;
          setText("");
          timer = setTimeout(tick, 500);
          return;
        }
        setText(current.slice(0, char));
        timer = setTimeout(tick, 16);
      }
    };
    timer = setTimeout(tick, 2400);
    return () => clearTimeout(timer);
  }, [enabled]);
  return text;
}

function Readout({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className="flex flex-col gap-1 border-l border-line pl-4"
    >
      <span className="font-mono text-[10px] tracking-[0.26em] text-dim uppercase">{label}</span>
      <span className="font-mono text-[15px] tracking-[0.04em] text-bone tabular-nums">{value}</span>
    </motion.div>
  );
}

export default function Hero({
  started,
  onAnalyze,
}: {
  started: boolean;
  onAnalyze: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const placeholder = useTypedPlaceholder(started);
  const [latency, setLatency] = useState(42);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yHeadline = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    if (!started) return;
    const t2 = setInterval(() => setLatency(30 + Math.round(Math.random() * 46)), 1800);
    return () => clearInterval(t2);
  }, [started]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    sound.click();
    const url = value.trim()
      ? normalizeUrl(value)
      : EXAMPLE_URLS[Math.floor(Math.random() * EXAMPLE_URLS.length)];
    onAnalyze(url);
  }

  const base = started ? 0.15 : 10;
  const size = "text-[clamp(2.3rem,8vw,9.2rem)]";

  return (
    <section ref={sectionRef} id="top" className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <ParticleField className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,transparent_35%,#0a0b0c_92%)]" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[720px] rounded-full bg-lime/[0.05] blur-[140px]" />

      {/* vertical margin note */}
      <div className="pointer-events-none absolute bottom-24 left-4 hidden rotate-180 font-mono text-[11px] tracking-[0.4em] text-dim uppercase [writing-mode:vertical-rl] xl:block">
        Generative Engine Optimization — Audit 2025
      </div>

      <motion.div
        style={{ y: yHeadline, opacity }}
        className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-5 pb-8 pt-28 md:px-10 xl:pl-20"
      >
        {/* top row: label left, statement far right */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: base + 0.1 }}
            className="col-span-12 flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-mute uppercase md:col-span-5"
          >
            <span className="h-px w-10 bg-lime" />
            GEO Audit · Live Engine
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: base + 0.7 }}
            className="col-span-12 max-w-sm text-base leading-relaxed text-mute md:col-span-4 md:col-start-9"
          >
            Measure your <span className="text-bone">Generative Engine Optimization score</span>. See exactly what
            ChatGPT, Perplexity and Gemini think of your content.
          </motion.p>
        </div>

        {/* staircase headline */}
        <h1 className="my-auto py-10 font-arch font-expanded font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-bone md:py-14">
          <span className={`block ${size}`}>
            <SplitText text="ANALYZE YOUR" delay={base + 0.25} />
          </span>
          <span className={`block ${size} md:pl-[9%]`}>
            <SplitText text="ENTERPRISE" delay={base + 0.42} />
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={started ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE, delay: base + 1.0 }}
              className="ml-[0.18em] inline-flex h-[0.42em] w-[1.7em] translate-y-[-0.55em] items-center justify-center rounded-full border border-lime/50 font-mono text-[0.13em] font-normal tracking-[0.2em] text-lime"
            >
              GEO
            </motion.span>
          </span>
          <span className={`block ${size} md:pl-[17%]`}>
            <SplitText text="SEARCH" delay={base + 0.59} />{" "}
            <span className="font-serif normal-case italic tracking-normal text-lime">
              <SplitText text="visibility" delay={base + 0.76} />
            </span>
          </span>
        </h1>

        {/* command row: input bottom-left, readouts right */}
        <div className="grid grid-cols-12 items-end gap-x-6 gap-y-8 border-t border-line pt-7">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE, delay: base + 0.9 }}
            className="col-span-12 lg:col-span-7"
          >
            <form
              onSubmit={submit}
              className="group flex items-center gap-2 rounded-full border border-line bg-panel/80 p-2 pl-5 backdrop-blur-md transition-colors duration-300 focus-within:border-lime/60"
            >
              <Globe className="h-5 w-5 shrink-0 text-dim transition-colors group-focus-within:text-lime" />
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    sound.hover();
                  }}
                  aria-label="Target URL"
                  className="w-full bg-transparent py-1 font-mono text-[15px] text-bone outline-none placeholder:text-dim md:text-base"
                  placeholder={placeholder || "https://yourdomain.com/page"}
                />
              </div>
              <Magnetic strength={0.2}>
                <button
                  type="submit"
                  data-hover
                  className="flex shrink-0 items-center gap-2 rounded-full bg-lime px-5 py-3.5 font-mono text-[12px] font-medium tracking-[0.14em] text-ink uppercase transition-transform duration-300 hover:scale-[1.03] active:scale-95 md:px-7"
                >
                  <ScanSearch className="h-4 w-4" />
                  <span>Scan</span>
                </button>
              </Magnetic>
            </form>
            <p className="mt-3 pl-5 font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
              Public pages &amp; blog posts · GPT · PPLX · GEM · CLD
            </p>
          </motion.div>

          <div className="col-span-12 grid grid-cols-2 gap-4 lg:col-span-4 lg:col-start-9">
            <Readout label="Corpus index" value="2.41B pages" delay={base + 1.1} />
            <Readout label="Engine latency" value={`${latency}ms`} delay={base + 1.2} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={started ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: base + 1.4 }}
        className="relative z-10 flex items-center justify-between border-t border-line px-5 py-4 font-mono text-[11px] tracking-[0.3em] text-dim uppercase md:px-10"
      >
        <span>Scroll to explore</span>
        <span className="tabular-nums">01 / 06</span>
      </motion.div>
    </section>
  );
}
