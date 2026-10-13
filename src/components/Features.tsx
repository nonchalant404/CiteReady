import { ArrowUpRight, Quote, Radar, Network, Waypoints } from "lucide-react";
import { Reveal, CountUp } from "./ui";
import { cn } from "../utils/cn";

const FEATURES = [
  {
    icon: Waypoints,
    title: "Ingestion & Bot Directives",
    tag: "Crawlability",
    desc: "We check whether GPTBot, PerplexityBot and ClaudeBot are allowed in robots.txt, and whether /llms.txt exists.",
  },
  {
    icon: Quote,
    title: "Quotability Index",
    tag: "Synthesizability",
    desc: "We score how easily a model can lift a sentence verbatim — concise, atomic claims win.",
  },
  {
    icon: Network,
    title: "Knowledge-Graph Salience",
    tag: "Disambiguation",
    desc: "Do engines know what you are? We audit your JSON-LD schema against Wikidata.",
  },
  {
    icon: Radar,
    title: "Cross-Engine Probing",
    tag: "Simulation",
    desc: "Live query simulations across ChatGPT, Perplexity, Gemini and Claude 3.7.",
  },
];

const STATS = [
  { value: 2.4, decimals: 1, suffix: "B", label: "Pages / week" },
  { value: 40, suffix: "+", label: "GEO signals" },
  { value: 4, suffix: "", label: "Engines" },
  { value: 97.2, decimals: 1, suffix: "%", label: "Confidence" },
];

const MATRIX = [
  { dim: "Objective", seo: "Rank #1 on 10 blue links", geo: "Become the cited answer [1]" },
  { dim: "Currency", seo: "Backlinks & keywords", geo: "Information gain & stats" },
  { dim: "Format", seo: "Heavy HTML / JS", geo: "Markdown via /llms.txt" },
  { dim: "Behavior", seo: "Click 3–5 links", geo: "Zero-click single answer" },
];

export default function Features() {
  return (
    <section id="method" className="relative px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-x-6 gap-y-16">
          {/* sticky left column: index, heading, stat ledger */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <span className="block font-arch font-expanded text-[clamp(5rem,11vw,10rem)] font-bold leading-[0.8] text-stroke">
                02
              </span>
              <Reveal delay={0.1}>
                <h2 className="mt-8 font-arch font-expanded text-[clamp(2.4rem,4.8vw,4.8rem)] font-semibold uppercase leading-[0.95] tracking-[-0.02em]">
                  Built for
                  <br />
                  machines
                  <br />
                  <span className="font-serif normal-case italic tracking-normal text-lime">that read.</span>
                </h2>
              </Reveal>

              <dl className="mt-14 hidden max-w-sm divide-y divide-line border-y border-line lg:block">
                {STATS.map((s, i) => (
                  <Reveal key={s.label} delay={i * 0.07} y={14}>
                    <div className="flex items-baseline justify-between py-4">
                      <dt className="font-mono text-[12px] tracking-[0.22em] text-mute uppercase">{s.label}</dt>
                      <dd className="font-arch font-expanded text-3xl font-semibold tabular-nums text-bone">
                        <CountUp to={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>

          {/* staggered feature blocks */}
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-7">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.05} y={30} className={cn(i % 2 === 1 && "lg:ml-20")}>
                <div data-hover className="group relative overflow-hidden border border-line bg-panel/40">
                  <div className="absolute inset-0 origin-bottom scale-y-0 bg-lime transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
                  <div className="relative p-7 transition-colors duration-500 group-hover:text-ink md:p-10">
                    <div className="flex items-start justify-between">
                      <span className="font-arch font-expanded text-6xl font-bold leading-none text-stroke transition-colors duration-500 group-hover:[-webkit-text-stroke-color:rgba(10,11,12,0.55)]">
                        0{i + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-line px-3 py-1 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 group-hover:border-ink/30">
                          {f.tag}
                        </span>
                        <ArrowUpRight className="h-5 w-5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                      </div>
                    </div>
                    <h3 className="mt-10 flex items-center gap-4 font-arch font-expanded text-2xl font-semibold tracking-tight md:text-3xl">
                      <f.icon className="h-7 w-7 shrink-0 text-lime transition-colors duration-500 group-hover:text-ink" strokeWidth={1.5} />
                      {f.title}
                    </h3>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-mute transition-colors duration-500 group-hover:text-ink/80">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* mobile-only stat strip (ledger is hidden below lg) */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line lg:hidden">
          {STATS.map((s) => (
            <div key={s.label} className="bg-panel p-6">
              <div className="font-arch font-expanded text-3xl font-semibold tabular-nums text-bone">
                <CountUp to={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-[0.2em] text-mute uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        {/* split-screen versus */}
        <Reveal delay={0.1} className="mt-28">
          <div className="relative grid border border-line md:grid-cols-2">
            <div className="hidden h-16 w-16 items-center justify-center rounded-full border border-line bg-ink font-mono text-sm tracking-widest text-mute md:absolute md:left-1/2 md:top-1/2 md:z-10 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
              VS
            </div>

            <div className="border-b border-line bg-panel/40 p-8 md:border-b-0 md:border-r md:p-12">
              <p className="font-mono text-[12px] tracking-[0.28em] text-dim uppercase">Then</p>
              <h3 className="mt-3 font-arch font-expanded text-3xl font-bold text-mute md:text-4xl">Traditional SEO</h3>
              <ul className="mt-8 divide-y divide-line">
                {MATRIX.map((r) => (
                  <li key={r.dim} className="py-4">
                    <span className="block font-mono text-[11px] tracking-[0.22em] text-dim uppercase">{r.dim}</span>
                    <span className="mt-1 block text-lg text-mute line-through decoration-dim/60">{r.seo}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-lime/[0.05] p-8 md:p-12">
              <p className="font-mono text-[12px] tracking-[0.28em] text-lime uppercase">Now</p>
              <h3 className="mt-3 font-arch font-expanded text-3xl font-bold text-bone md:text-4xl">GEO</h3>
              <ul className="mt-8 divide-y divide-line">
                {MATRIX.map((r) => (
                  <li key={r.dim} className="py-4">
                    <span className="block font-mono text-[11px] tracking-[0.22em] text-lime/70 uppercase">{r.dim}</span>
                    <span className="mt-1 block text-lg font-medium text-bone">{r.geo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
