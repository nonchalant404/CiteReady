import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Reveal } from "./ui";
import { sound } from "../lib/sound";
import { cn } from "../utils/cn";

interface SignalToggle {
  id: string;
  label: string;
  points: number;
  description: string;
}

const SIGNALS: SignalToggle[] = [
  { id: "bots", label: "Allow GPTBot & PerplexityBot in robots.txt", points: 18, description: "Let AI search agents index your pages." },
  { id: "llms", label: "Publish /llms.txt Markdown manifest", points: 15, description: "Zero-HTML summary for instant LLM ingestion." },
  { id: "stats", label: "Add primary benchmarks (p99, sample size)", points: 22, description: "Hard numbers that RAG models prefer." },
  { id: "schema", label: "Link JSON-LD to Wikidata / Wikipedia", points: 14, description: "Disambiguate your brand to stop hallucination." },
];

export default function SignalSandbox({ onAudit }: { onAudit: () => void }) {
  const [activeIds, setActiveIds] = useState<string[]>(["bots"]);

  const toggle = (id: string) => {
    setActiveIds((prev) => {
      const enabling = !prev.includes(id);
      const next = enabling ? [...prev, id] : prev.filter((x) => x !== id);
      if (enabling) sound.rise(next.length);
      else sound.fall();
      return next;
    });
  };

  const baseScore = 32;
  const gained = SIGNALS.filter((s) => activeIds.includes(s.id)).reduce((acc, s) => acc + s.points, 0);
  const currentScore = Math.min(99, baseScore + gained);
  const tone = currentScore >= 80 ? "text-lime" : currentScore >= 60 ? "text-bone" : "text-ember";
  const verdict =
    currentScore >= 80 ? "PRIMARY CITATION [1]" : currentScore >= 60 ? "CONDITIONAL SOURCE" : "IGNORED BY ENGINES";

  return (
    <section id="signals" className="relative border-t border-line px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-x-8 gap-y-14">
          {/* score — left, oversized, sticky */}
          <div className="col-span-12 lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <span className="block font-arch font-expanded text-[clamp(5rem,11vw,10rem)] font-bold leading-[0.8] text-stroke">
                04
              </span>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-arch font-expanded text-[clamp(2.2rem,4.4vw,4.2rem)] font-semibold uppercase leading-[0.95] tracking-tight">
                  Watch your score
                  <br />
                  <span className="font-serif italic font-normal text-lime normal-case">climb in real-time.</span>
                </h2>
              </Reveal>

              <div className="mt-12 flex items-end gap-4">
                <motion.span
                  key={currentScore}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={cn("font-arch font-expanded text-[clamp(6.5rem,15vw,13rem)] font-bold leading-[0.78] tracking-tight tabular-nums", tone)}
                >
                  {currentScore}
                </motion.span>
                <span className="pb-2 font-mono text-xl text-dim">/ 100</span>
              </div>

              <div className="mt-8 h-[3px] w-full max-w-lg bg-line">
                <div
                  className={cn("h-full transition-all duration-500", currentScore >= 80 ? "bg-lime" : currentScore >= 60 ? "bg-bone" : "bg-ember")}
                  style={{ width: `${currentScore}%` }}
                />
              </div>
              <p className={cn("mt-5 font-mono text-sm tracking-[0.18em]", tone)}>{verdict}</p>

              <button
                onClick={() => {
                  sound.click();
                  onAudit();
                }}
                data-hover
                className="mt-10 rounded-full bg-lime px-8 py-4 font-mono text-[13px] font-bold tracking-[0.16em] text-ink uppercase transition-transform hover:scale-[1.03] active:scale-95"
              >
                Audit your URL
              </button>
            </div>
          </div>

          {/* toggles — right, as a plain ruled checklist */}
          <div className="col-span-12 lg:col-span-6 lg:pt-32">
            <p className="mb-4 font-mono text-[12px] tracking-[0.26em] text-dim uppercase">Toggle signals</p>
            <div className="border-b border-line">
              {SIGNALS.map((s, i) => {
                const active = activeIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    data-hover
                    className="group flex w-full items-start gap-5 border-t border-line py-8 text-left"
                  >
                    <span className="mt-1 font-mono text-sm tabular-nums text-dim">0{i + 1}</span>
                    <span
                      className={cn(
                        "mt-1 flex h-7 w-7 shrink-0 items-center justify-center border transition-colors",
                        active ? "border-lime bg-lime text-ink" : "border-dim text-transparent group-hover:border-bone"
                      )}
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                    <span className="flex-1">
                      <span className={cn("block font-arch text-xl font-semibold leading-snug transition-colors md:text-2xl", active ? "text-bone" : "text-mute")}>
                        {s.label}
                      </span>
                      <span className="mt-2 block text-base text-mute">{s.description}</span>
                    </span>
                    <span className={cn("font-mono text-base font-semibold tabular-nums transition-colors", active ? "text-lime" : "text-dim")}>
                      +{s.points}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
