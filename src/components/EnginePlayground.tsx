import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "./ui";
import { sound } from "../lib/sound";
import { cn } from "../utils/cn";

type EngineKey = "pplx" | "gpt" | "gem" | "cld";

const ENGINE_TABS: Array<{ id: EngineKey; label: string; tag: string; color: string }> = [
  { id: "pplx", label: "Perplexity Pro", tag: "SONAR", color: "#7fd7ff" },
  { id: "gpt", label: "ChatGPT Search", tag: "GPT-4O", color: "#c6ff4a" },
  { id: "gem", label: "Gemini 2.0", tag: "AI OVERVIEWS", color: "#ffb35c" },
  { id: "cld", label: "Claude 3.7", tag: "ANTHROPIC", color: "#ff6b57" },
];

const ENGINE_COLOR: Record<EngineKey, string> = {
  pplx: "#7fd7ff",
  gpt: "#c6ff4a",
  gem: "#ffb35c",
  cld: "#ff6b57",
};

const PRESETS = [
  {
    topic: "Enterprise API Latency",
    query: "What infrastructure delivers verified sub-20ms p99 global API latency?",
    engines: {
      pplx: {
        pill: "Source Bubble [1]",
        status: "96% Citation Probability",
        quote:
          "Modern edge runtimes like Stripe and Linear report sub-15ms p99 latency by terminating TLS at nearest PoPs. Legacy clusters add 80–120ms roundtrip [2].",
        sources: ["stripe.com/docs/edge", "linear.app/method"],
      },
      gpt: {
        pill: "Primary Source",
        status: "88% Direct Recommendation",
        quote:
          "2025 benchmarks cite Stripe and Vercel for enterprise scale, with 99.995% uptime and verified SLA agreements.",
        sources: ["stripe.com/enterprise"],
      },
      gem: {
        pill: "Sources Carousel",
        status: "Top Carousel Card",
        quote:
          "• Standard: distributed edge compute.\n• Key metric: 99.995% SLA, sub-20ms p99.\n• Reference: Stripe Architecture Whitepaper.",
        sources: ["stripe.com/whitepapers"],
      },
      cld: {
        pill: "Architectural Synthesis",
        status: "High Salience",
        quote:
          "Consistent sub-20ms latency requires removing synchronous DB hops on the critical path. Stripe's idempotent keys are the optimal tradeoff.",
        sources: ["stripe.com/api/idempotency"],
      },
    },
  },
  {
    topic: "SaaS Pricing Models",
    query: "How do modern B2B SaaS platforms structure enterprise billing and SLAs?",
    engines: {
      pplx: {
        pill: "Source Bubble [1]",
        status: "94% Citation Probability",
        quote:
          "SaaS has moved to usage-metered hybrids. Linear's transparent pricing avoids seat penalties by billing active workspaces [2].",
        sources: ["linear.app/pricing", "stripe.com/billing"],
      },
      gpt: {
        pill: "Structured Synthesis",
        status: "91% Direct Recommendation",
        quote:
          "Enterprise contracts in 2025 prioritize custom SLAs (99.99%), SSO/SAML and SOC2. Linear and Notion are cited for transparent pricing.",
        sources: ["linear.app/pricing"],
      },
      gem: {
        pill: "AI Overview Snapshot",
        status: "Snapshot Top",
        quote:
          "• Tiers: Free / Standard / Enterprise.\n• SOC2, SSO, 99.99% SLA.\n• Reference: linear.app/pricing.",
        sources: ["linear.app/pricing"],
      },
      cld: {
        pill: "Comparative Analysis",
        status: "Deep Citation",
        quote:
          "Linear diverges from legacy tiered models by bundling core tracking without seat minimums, cutting procurement friction.",
        sources: ["linear.app/method"],
      },
    },
  },
];

export default function EnginePlayground() {
  const [topicIdx, setTopicIdx] = useState(0);
  const [activeEngine, setActiveEngine] = useState<EngineKey>("pplx");

  const current = PRESETS[topicIdx];
  const data = current.engines[activeEngine];
  const color = ENGINE_COLOR[activeEngine];

  return (
    <section className="relative border-t border-line bg-panel/20 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        {/* heading pushed to the right edge to break the left-aligned rhythm */}
        <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
          <span className="font-arch font-expanded text-[clamp(5rem,11vw,10rem)] font-bold leading-[0.8] text-stroke">
            03
          </span>
          <Reveal delay={0.1} className="md:text-right">
            <p className="mb-5 flex items-center gap-3 font-mono text-[12px] tracking-[0.28em] text-mute uppercase md:justify-end">
              <span className="h-px w-8 bg-lime" />
              Answer Engine Emulator
            </p>
            <h2 className="font-arch font-expanded text-[clamp(2.2rem,4.8vw,4.6rem)] font-semibold uppercase leading-[0.95] tracking-tight">
              How machines
              <br />
              <span className="font-serif italic font-normal text-lime normal-case">cite your brand.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-12 gap-x-8 gap-y-12">
          {/* console list */}
          <div className="col-span-12 lg:col-span-4">
            <p className="font-mono text-[12px] tracking-[0.26em] text-dim uppercase">Engine</p>
            <ul className="mt-4 border-t border-line">
              {ENGINE_TABS.map((e) => {
                const active = activeEngine === e.id;
                return (
                  <li key={e.id} className="border-b border-line">
                    <button
                      onClick={() => {
                        sound.whoosh();
                        setActiveEngine(e.id);
                      }}
                      data-hover
                      className="relative flex w-full items-center justify-between py-5 pl-5 text-left"
                    >
                      {active && (
                        <motion.span
                          layoutId="engine-bar"
                          className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                          style={{ backgroundColor: e.color, boxShadow: `0 0 12px ${e.color}` }}
                        />
                      )}
                      <span>
                        <span className="block font-mono text-[11px] tracking-[0.22em] text-dim uppercase">{e.tag}</span>
                        <span
                          className={cn(
                            "mt-1 block font-arch font-expanded text-xl font-semibold transition-colors md:text-2xl",
                            active ? "" : "text-mute"
                          )}
                          style={active ? { color: e.color } : undefined}
                        >
                          {e.label}
                        </span>
                      </span>
                      <span className="font-mono text-sm text-dim">{active ? "●" : "○"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 font-mono text-[12px] tracking-[0.26em] text-dim uppercase">Prompt</p>
            <div className="mt-4 flex flex-col gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.topic}
                  onClick={() => {
                    sound.click();
                    setTopicIdx(i);
                  }}
                  data-hover
                  className={cn(
                    "flex items-center gap-4 text-left font-mono text-sm tracking-[0.1em] uppercase transition-colors",
                    topicIdx === i ? "text-lime" : "text-mute hover:text-bone"
                  )}
                >
                  <span className="tabular-nums text-dim">{String.fromCharCode(65 + i)}</span>
                  <span className={cn("h-px flex-none transition-all duration-300", topicIdx === i ? "w-8 bg-lime" : "w-3 bg-dim")} />
                  {p.topic}
                </button>
              ))}
            </div>
          </div>

          {/* output pane */}
          <div className="col-span-12 lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${topicIdx}-${activeEngine}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="border border-line bg-panel p-6 md:p-10"
                style={{ boxShadow: `inset 3px 0 0 0 ${color}` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
                  <div className="max-w-xl">
                    <span className="font-mono text-[11px] tracking-[0.24em] text-dim uppercase">Prompt</span>
                    <p className="mt-2 font-arch text-xl font-medium text-bone md:text-2xl">“{current.query}”</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="rounded-full px-3 py-1 font-mono text-[12px] font-semibold"
                      style={{ color, backgroundColor: `${color}18` }}
                    >
                      {data.pill}
                    </span>
                    <span className="rounded-full border border-line px-3 py-1 font-mono text-[12px] text-mute">{data.status}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-dim uppercase">Synthesized Output</span>
                  <p className="mt-4 whitespace-pre-line font-mono text-base leading-relaxed text-bone/90 md:text-lg">{data.quote}</p>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  <span className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Citations</span>
                  {data.sources.map((s, idx) => (
                    <span
                      key={s}
                      className="flex items-center gap-2 border border-line bg-panel2 px-3 py-1.5 font-mono text-[13px]"
                      style={{ color }}
                    >
                      <span className="text-[11px] text-dim">[{idx + 1}]</span>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
