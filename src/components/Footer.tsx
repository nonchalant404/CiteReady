import { ArrowUp, BookOpen } from "lucide-react";
import { Reveal } from "./ui";
import { sound } from "../lib/sound";
import { scrollToTop } from "../lib/scroll";
import { LogoWordmark } from "./Logo";

const COLS = [
  { title: "Product", items: ["Live Audit", "Answer Simulator", "Signal Sandbox", "llms.txt"] },
  { title: "Intelligence", items: ["Method Paper", "Manifesto", "Bot Guide", "Knowledge Graph"] },
  { title: "Engines", items: ["ChatGPT", "Perplexity", "Gemini", "Claude"] },
];

export default function Footer({ onOpenDocs }: { onOpenDocs?: () => void }) {
  return (
    <footer className="relative border-t border-line bg-panel/30 px-5 pt-20 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-12 gap-x-8 gap-y-14 pb-20">
          <Reveal className="col-span-12 lg:col-span-5">
            <div>
              <LogoWordmark size={30} />
              <p className="mt-6 max-w-sm text-base leading-relaxed text-mute">
                The visibility layer for the answer era. Built for teams that refuse to be invisible to machines.
              </p>
              {onOpenDocs && (
                <button
                  onClick={() => {
                    sound.click();
                    onOpenDocs();
                  }}
                  data-hover
                  className="mt-8 flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-5 py-2.5 font-mono text-[12px] tracking-[0.1em] text-lime uppercase transition-colors hover:bg-lime hover:text-ink"
                >
                  <BookOpen className="h-4 w-4" />
                  Engine Docs
                </button>
              )}
            </div>
          </Reveal>

          <div className="col-span-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {COLS.map((col, ci) => (
              <Reveal key={col.title} delay={0.08 * (ci + 1)}>
                <div>
                  <h4 className="border-b border-line pb-3 font-mono text-[12px] tracking-[0.28em] text-dim uppercase">
                    {col.title}
                  </h4>
                  <ul className="mt-5 space-y-3">
                    {col.items.map((item) => (
                      <li key={item}>
                        <a
                          href="#top"
                          data-hover
                          onClick={() => sound.tick()}
                          className="link-underline text-base text-mute transition-colors hover:text-bone"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border-t border-line">
          <Reveal y={60}>
            <div className="flex items-end justify-between gap-6 pt-8">
              <h2 className="whitespace-nowrap font-arch font-expanded text-[11.5vw] font-bold uppercase leading-[0.85] tracking-[-0.03em] text-bone">
                Cite<span className="text-stroke">Ready</span>
                <span className="align-super font-mono text-[2vw] text-lime">®</span>
              </h2>
              <button
                onClick={() => {
                  sound.click();
                  scrollToTop();
                }}
                aria-label="Back to top"
                data-hover
                className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line text-mute transition-all duration-300 hover:border-lime hover:bg-lime hover:text-ink md:mb-6"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-line py-6 font-mono text-[12px] tracking-[0.22em] text-dim uppercase md:flex-row md:items-center">
          <span>© 2025 CiteReady Labs</span>
          <span>Deterministic GEO Audit</span>
          <span>SF — DE</span>
        </div>
      </div>
    </footer>
  );
}
