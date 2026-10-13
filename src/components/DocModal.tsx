import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, Cpu, Layers, Database } from "lucide-react";
import { sound } from "../lib/sound";

export default function DocModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md md:p-10"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line bg-panel2 px-6 py-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-lime" />
                <span className="font-arch font-bold text-bone">Engine Architecture</span>
                <span className="rounded bg-lime/10 px-2 py-0.5 font-mono text-[9px] text-lime">GEO_DOCUMENTATION.md</span>
              </div>
              <button onClick={() => { sound.click(); onClose(); }} data-hover data-cursor="action" className="rounded-full border border-line p-2 text-mute hover:border-lime hover:text-bone transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              data-lenis-prevent
              className="overlay-scroll min-h-0 flex-1 overflow-y-auto p-6 md:p-8 space-y-8 font-mono text-xs text-mute leading-relaxed"
            >
              <div>
                <h3 className="font-arch text-lg font-bold text-bone flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-lime" /> Where does the engine come from?
                </h3>
                <p className="mt-2 text-bone/80">
                  CiteReady runs a 4-layer hybrid pipeline that mirrors how OpenAI, Perplexity, Google and Anthropic actually retrieve and synthesize:
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-line bg-ink p-4">
                    <span className="text-lime font-bold">A. Ingestion & Directives</span>
                    <p className="mt-1">Parses robots.txt for GPTBot, PerplexityBot, ClaudeBot and Google-Extended. Detects the /llms.txt markdown manifest.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-ink p-4">
                    <span className="text-lime font-bold">B. Knowledge Graph</span>
                    <p className="mt-1">Maps JSON-LD schema to Wikidata to prevent brand hallucination and entity confusion.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-ink p-4">
                    <span className="text-lime font-bold">C. Deterministic RAG Sim</span>
                    <p className="mt-1">FNV-1a seeded PRNG — the same URL always returns the same reproducible audit.</p>
                  </div>
                  <div className="rounded-xl border border-line bg-ink p-4">
                    <span className="text-lime font-bold">D. Multi-LLM Probing</span>
                    <p className="mt-1">Emulates SearchGPT, Perplexity Pro, Gemini 2.0 and Claude 3.7 citation placement.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-line pt-6">
                <h3 className="font-arch text-lg font-bold text-bone flex items-center gap-2">
                  <Layers className="h-4 w-4 text-lime" /> Why GEO, not SEO?
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-line text-dim">
                        <th className="pb-2">Aspect</th>
                        <th className="pb-2 text-mute">SEO</th>
                        <th className="pb-2 text-lime">GEO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {[
                        ["Output", "10 blue links", "One answer + 2 sources [1]"],
                        ["Currency", "Backlinks", "Information gain & stats"],
                        ["Format", "Heavy HTML", "Markdown via /llms.txt"],
                      ].map((r) => (
                        <tr key={r[0]}>
                          <td className="py-2.5 font-bold text-bone">{r[0]}</td>
                          <td className="py-2.5">{r[1]}</td>
                          <td className="py-2.5 text-bone">{r[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-line pt-6">
                <h3 className="font-arch text-lg font-bold text-bone flex items-center gap-2">
                  <Database className="h-4 w-4 text-lime" /> 5 quick implementation steps
                </h3>
                <div className="mt-3 space-y-2">
                  {[
                    "Allow GPTBot & PerplexityBot in robots.txt",
                    "Publish /llms.txt markdown manifest",
                    "Write a 20-word atomic claim under H1 with real numbers",
                    "Add JSON-LD sameAs → Wikidata / Wikipedia",
                    "Show an explicit dateModified timestamp",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-lime">▸</span>
                      <span className="text-bone/85">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line px-6 py-4 bg-panel2">
              <span className="font-mono text-[10px] text-dim">Full docs in GEO_DOCUMENTATION.md</span>
              <button onClick={() => { sound.click(); onClose(); }} data-hover data-cursor="action" className="rounded-full bg-lime px-5 py-2 font-mono text-[10px] font-bold text-ink uppercase">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
