import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import {
  X,
  RotateCcw,
  PenLine,
  Check,
  Bot,
  Sparkles,
  Code2,
  Swords,
  Share2,
  Download,
  Copy,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  FileScan,
  Volume2,
  VolumeX,
} from "lucide-react";
import { analyzeUrl, normalizeUrl, type AnalysisResult, type ExtractKind } from "../lib/analyze";
import { EASE, Magnetic } from "./ui";
import { sound } from "../lib/sound";
import Waveform from "./Waveform";
import { cn } from "../utils/cn";

const EXTRACT_META: Record<ExtractKind, { label: string; color: string; note: string }> = {
  stat: { label: "PRIMARY DATA", color: "#c6ff4a", note: "Numeric, sourced, high value" },
  claim: { label: "ATOMIC CLAIM", color: "#7fd7ff", note: "Self-contained assertion" },
  entity: { label: "ENTITY FACT", color: "#ffb35c", note: "Graph-resolvable attribute" },
  fluff: { label: "PROMOTIONAL", color: "#ff6b57", note: "Discarded by the retriever" },
};

type TabKey = "overview" | "simulation" | "extraction" | "bots" | "rewrite" | "competitor";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Bot }> = [
  { key: "overview", label: "Score", icon: SlidersHorizontal },
  { key: "simulation", label: "AI Answers", icon: Bot },
  { key: "extraction", label: "Extraction", icon: FileScan },
  { key: "bots", label: "Crawlers", icon: ShieldCheck },
  { key: "rewrite", label: "Fixes", icon: Code2 },
  { key: "competitor", label: "Rival", icon: Swords },
];

/* ==================== scan phase ==================== */

function ScanScreen({
  url,
  editing,
  progress,
  lines,
  onSubmit,
}: {
  url: string;
  editing: boolean;
  progress: number;
  lines: string[];
  onSubmit: (url: string) => void;
}) {
  const [draft, setDraft] = useState(url);

  return (
    <div className="relative flex min-h-[calc(100dvh-57px)] flex-col justify-center overflow-hidden px-5 py-20 md:px-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/[0.05] blur-[150px]" />
      <div className="scanline pointer-events-none absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-lime/[0.06] to-transparent" />

      <div className="relative mx-auto w-full max-w-[1600px]">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-dim uppercase">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-lime" />
          {editing ? "Enter new target URL" : "Probing answer-engine RAG pipelines"}
        </div>

        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = draft.trim();
              if (v) {
                sound.click();
                onSubmit(normalizeUrl(v));
              }
            }}
            className="mt-6 flex max-w-3xl items-center gap-3 border-b-2 border-lime pb-4"
          >
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="https://yourdomain.com/page"
              className="w-full bg-transparent font-mono text-xl text-bone outline-none placeholder:text-dim md:text-3xl"
            />
            <button type="submit" data-hover data-cursor="action" className="shrink-0 rounded-full bg-lime px-6 py-2.5 font-mono text-[11px] font-medium tracking-[0.14em] text-ink uppercase">
              Scan
            </button>
          </form>
        ) : (
          <h2 className="mt-6 max-w-5xl break-all font-mono text-2xl leading-tight text-lime md:text-5xl">{url}</h2>
        )}

        <div className="mt-10 flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.24em] text-dim uppercase">Ingestion signal</span>
          <Waveform className="h-10 flex-1 max-w-xl" color="#c6ff4a" bars={84} idle={editing} />
          <span className="font-mono text-[10px] text-lime tabular-nums">{Math.round(progress)}%</span>
        </div>

        <div className="mt-10 min-h-[230px] max-w-3xl font-mono text-[12px] leading-[2.15] text-mute md:text-[13px]">
          <AnimatePresence initial={false}>
            {lines.map((l, i) => (
              <motion.p key={`${i}-${l}`} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.32, ease: EASE }} className="flex items-baseline gap-3">
                <span className="text-lime">▸</span>
                <span className="text-dim tabular-nums">T+{(i * 0.52 + 0.08).toFixed(2)}s</span>
                <span className="text-bone/90">{l}</span>
                {i === lines.length - 1 && <span className="inline-block h-3.5 w-2 self-center bg-lime animate-blink" />}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 max-w-3xl">
          <div className="mb-3 flex justify-between font-mono text-[10px] tracking-[0.28em] text-dim uppercase">
            <span>Aggregating citation index</span>
            <span className="font-semibold text-lime tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <motion.div className="h-full rounded-full bg-lime shadow-[0_0_16px_3px_rgba(198,255,74,0.65)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== gauge ==================== */

function Gauge({ score, grade }: { score: number; grade: string }) {
  const [display, setDisplay] = useState(0);
  const R = 80;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const controls = animate(0, score, { duration: 1.8, ease: EASE, delay: 0.3, onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [score]);

  return (
    <div className="relative mx-auto h-[230px] w-[230px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        {Array.from({ length: 41 }).map((_, i) => {
          const long = i % 5 === 0;
          return (
            <line key={i} x1="100" y1="8" x2="100" y2={long ? "16" : "12"} stroke={long ? "rgba(233,235,227,0.25)" : "rgba(233,235,227,0.1)"} strokeWidth="1" transform={`rotate(${i * 9} 100 100)`} />
          );
        })}
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(233,235,227,0.08)" strokeWidth="6" />
        <motion.circle cx="100" cy="100" r={R} fill="none" stroke="#c6ff4a" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - score / 100) }} transition={{ duration: 1.8, ease: EASE, delay: 0.3 }} style={{ filter: "drop-shadow(0 0 10px rgba(198,255,74,0.5))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[9px] tracking-[0.34em] text-mute uppercase">GEO Score</span>
        <span className="font-arch font-expanded text-6xl font-semibold leading-none tracking-tight text-bone tabular-nums md:text-7xl">{display}</span>
        <span className={cn("mt-2 rounded-full border px-3 py-0.5 font-mono text-[10px] tracking-[0.2em]", score >= 75 ? "border-lime/60 bg-lime/10 text-lime" : score >= 50 ? "border-bone/30 bg-bone/5 text-bone" : "border-ember/60 bg-ember/10 text-ember")}>
          GRADE {grade}
        </span>
      </div>
    </div>
  );
}

/* ==================== radar ==================== */

const RADAR_R = 44;
function radarPoints(values: number[], scale = 1): string {
  return values.map((v, i) => {
    const a = (-90 + i * (360 / values.length)) * (Math.PI / 180);
    const r = (v / 100) * RADAR_R * scale;
    return `${(50 + Math.cos(a) * r).toFixed(2)}% ${(50 + Math.sin(a) * r).toFixed(2)}%`;
  }).join(", ");
}
function Radar({ values, labels }: { values: number[]; labels: string[] }) {
  const target = useMemo(() => radarPoints(values), [values]);
  const center = useMemo(() => values.map(() => "50% 50%").join(", "), [values]);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[330px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={radarPoints(values.map(() => 100), f)} fill="none" stroke="rgba(233,235,227,0.09)" strokeWidth="0.4" />
        ))}
        {values.map((_, i) => {
          const a = (-90 + i * (360 / values.length)) * (Math.PI / 180);
          return <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * RADAR_R} y2={50 + Math.sin(a) * RADAR_R} stroke="rgba(233,235,227,0.09)" strokeWidth="0.4" />;
        })}
      </svg>
      <motion.div className="absolute inset-0 bg-lime/20" initial={{ clipPath: `polygon(${center})`, opacity: 0 }} animate={{ clipPath: `polygon(${target})`, opacity: 1 }} transition={{ duration: 1.3, ease: EASE, delay: 0.4 }} style={{ filter: "drop-shadow(0 0 14px rgba(198,255,74,0.3))" }} />
      {values.map((v, i) => {
        const a = (-90 + i * (360 / values.length)) * (Math.PI / 180);
        const r = (v / 100) * RADAR_R;
        return (
          <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_6px_#c6ff4a]" style={{ left: `${50 + Math.cos(a) * r}%`, top: `${50 + Math.sin(a) * r}%` }} initial={{ scale: 0, translateX: "-50%", translateY: "-50%" }} animate={{ scale: 1, translateX: "-50%", translateY: "-50%" }} transition={{ duration: 0.5, ease: EASE, delay: 0.55 + i * 0.1 }} />
        );
      })}
      {labels.map((l, i) => {
        const a = (-90 + i * (360 / values.length)) * (Math.PI / 180);
        return (
          <motion.span key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.85 + i * 0.07 }} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center" style={{ left: `${50 + Math.cos(a) * (RADAR_R + 13)}%`, top: `${50 + Math.sin(a) * (RADAR_R + 13)}%` }}>
            <span className="whitespace-nowrap font-mono text-[8px] tracking-[0.16em] text-mute uppercase md:text-[9px]">{l}</span>
            <span className="font-mono text-[10px] font-semibold text-lime tabular-nums">{values[i]}</span>
          </motion.span>
        );
      })}
    </div>
  );
}

/* ==================== shell ==================== */

export default function Analysis({ initialUrl, onClose }: { initialUrl: string; onClose: () => void }) {
  const [phase, setPhase] = useState<"scan" | "results">("scan");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [url, setUrl] = useState(() => normalizeUrl(initialUrl));
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [muted, setMuted] = useState(!sound.enabled);
  const timers = useRef<number[]>([]);
  const toastTimer = useRef<number>(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const run = useCallback(
    (target: string) => {
      clearTimers();
      setPhase("scan");
      setActiveTab("overview");
      setEditing(false);
      setUrl(normalizeUrl(target));
      setLines([]);
      setProgress(0);

      const r = analyzeUrl(target);
      const script = [
        `RESOLVING DNS → ${r.host}`,
        `HTTP 200 OK · ${r.metrics.tokens.toLocaleString()} TOKENS EXTRACTED`,
        `PARSING robots.txt → GPTBot / PerplexityBot / ClaudeBot`,
        `PROBING /llms.txt … ${r.llmsTxtStatus.exists ? "FOUND" : "404"}`,
        `RESOLVING ${r.metrics.entities} ENTITIES`,
        `SCORING INFORMATION GAIN · QUOTABILITY`,
        `SYNTHESIZING ${r.engines.length} ENGINES …`,
        `COMPILING ENTERPRISE GEO REPORT`,
      ];

      const SCAN_MS = 4600;
      const step = SCAN_MS / (script.length + 1);
      sound.boot();
      const handle = sound.startScan(SCAN_MS);

      script.forEach((l, i) => {
        timers.current.push(window.setTimeout(() => {
          setLines((p) => [...p, l]);
          if (i % 2 === 0) sound.ping(i);
          else sound.tick();
        }, step * (i + 0.6)));
      });

      const controls = animate(0, 100, { duration: SCAN_MS / 1000, ease: [0.42, 0, 0.24, 1], onUpdate: (v) => setProgress(v) });
      timers.current.push(window.setTimeout(() => {
        controls.stop();
        handle?.stop(0.5);
        setResult(r);
        setPhase("results");
        sound.chime();
      }, SCAN_MS + 260));
    },
    [clearTimers]
  );

  useEffect(() => {
    const id = window.setTimeout(() => run(initialUrl), 120);
    return () => {
      window.clearTimeout(id);
      clearTimers();
      sound.stopScan(0.25);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.click();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => sound.stopScan(0.2), []);

  const copy = (text: string, key: string, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    sound.ding();
    showToast(`${label} copied`);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportJSON = () => {
    if (!result) return;
    sound.ding();
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `citeready-geo-${result.host.replace(/[^a-z0-9.]/gi, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    showToast("Report downloaded");
  };

  const copyShareLink = () => {
    if (!result) return;
    const link = `${window.location.origin}${window.location.pathname}?audit=${encodeURIComponent(result.url)}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    sound.ding();
    showToast("Share link copied");
  };

  const toggleMute = () => {
    const next = sound.setEnabled(!sound.enabled);
    setMuted(!next);
    if (next) sound.startAmbient();
  };

  const switchTab = (key: TabKey) => {
    if (key === activeTab) return;
    sound.whoosh();
    setActiveTab(key);
  };

  return (
    <motion.div data-lenis-prevent initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="noise overlay-scroll fixed inset-0 z-[120] overflow-x-hidden overflow-y-auto bg-ink">
      <div className="grid-bg pointer-events-none fixed inset-0" />

      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-ink/92 px-5 py-3.5 backdrop-blur-md md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-arch text-base font-bold tracking-tight text-bone">CiteReady</span>
          <span className="hidden rounded bg-lime/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-lime sm:block">GEO v2.5</span>
          {phase === "scan" && !editing && (
            <span className="flex items-center gap-2 font-mono text-[10px] text-lime">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
              <span className="flicker">ANALYZING</span>
            </span>
          )}
          {phase === "results" && result && <span className="hidden truncate font-mono text-[10px] text-mute md:block">/ {result.host}</span>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} data-hover aria-label="Toggle sound" className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors", muted ? "border-line bg-panel text-mute hover:border-bone/40 hover:text-bone" : "border-lime bg-lime/10 text-lime")}>
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{muted ? "Muted" : "SFX"}</span>
            {!muted && (
              <span className="hidden h-3 items-end gap-[2px] sm:flex">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-[2px] rounded-full bg-lime" animate={{ height: ["30%", "100%", "45%", "85%", "30%"] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }} />
                ))}
              </span>
            )}
          </button>

          {phase === "results" && (
            <div className="hidden items-center gap-2 sm:flex">
              <button onClick={copyShareLink} data-hover className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-mute uppercase transition-colors hover:border-lime hover:text-bone">
                <Share2 className="h-3 w-3" /> Share
              </button>
              <button onClick={exportJSON} data-hover className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] text-mute uppercase transition-colors hover:border-lime hover:text-bone">
                <Download className="h-3 w-3" /> JSON
              </button>
            </div>
          )}

          <button onClick={() => { sound.click(); onClose(); }} data-hover aria-label="Close audit" className="group flex items-center gap-2 rounded-full border border-line px-4 py-1.5 font-mono text-[10px] tracking-[0.18em] text-mute uppercase transition-colors hover:border-ember hover:text-ember">
            <span className="hidden sm:inline">Close</span>
            <X className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {phase === "scan" ? (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.4, ease: EASE }}>
              <ScanScreen url={url} editing={editing} progress={progress} lines={lines} onSubmit={run} />
            </motion.div>
          ) : (
            result && (
              <motion.div key="results" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.55, ease: EASE }} className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-8 md:px-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] text-dim uppercase">
                      <span>Audit complete</span>
                      <span>·</span>
                      <span className="text-lime">{result.auditedAt.slice(0, 10)}</span>
                      <span>·</span>
                      <span>{(result.metrics.latencyMs / 1000).toFixed(2)}s</span>
                    </div>
                    <h1 className="mt-2 break-all font-arch text-2xl font-bold tracking-tight text-bone md:text-4xl">{result.host}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Magnetic strength={0.2}>
                      <button onClick={() => { sound.click(); run(result.url); }} data-hover data-cursor="action" className="flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-mono text-[11px] font-medium tracking-[0.14em] text-ink uppercase transition-transform hover:scale-[1.03] active:scale-95">
                        <RotateCcw className="h-3.5 w-3.5" /> Re-scan
                      </button>
                    </Magnetic>
                    <button onClick={() => { sound.click(); clearTimers(); sound.stopScan(0.2); setPhase("scan"); setEditing(true); setLines([]); setProgress(0); }} data-hover data-cursor="action" className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-bone uppercase transition-colors hover:border-lime hover:text-lime">
                      <PenLine className="h-3.5 w-3.5" /> New URL
                    </button>
                  </div>
                </div>

                <div className="scrollbar-none -mx-5 mb-8 flex overflow-x-auto border-b border-line px-5 md:mx-0 md:px-0">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                      <button key={tab.key} onClick={() => switchTab(tab.key)} data-hover data-cursor="action" className={cn("relative flex shrink-0 items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors", active ? "font-semibold text-lime" : "text-mute hover:text-bone")}>
                        <Icon className="h-3.5 w-3.5" />
                        {tab.label}
                        {active && <motion.div layoutId="geo-tab-underline" className="absolute inset-x-0 bottom-0 h-0.5 bg-lime shadow-[0_0_8px_#c6ff4a]" />}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.32, ease: EASE }}>
                    {activeTab === "overview" && (
                      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                        <div className="flex flex-col gap-6">
                          <div className="rounded-2xl border border-line bg-panel p-8">
                            <Gauge score={result.score} grade={result.grade} />
                            <p className="mt-6 text-center font-mono text-[10px] leading-relaxed tracking-[0.16em] text-mute uppercase">
                              {result.score >= 75 ? "Citation magnet" : result.score >= 50 ? "Borderline" : "Invisible to engines"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
                            {[
                              { l: "Info Gain", v: `${result.metrics.informationGainRatio}×` },
                              { l: "Quotable", v: `${result.metrics.quotableSentencesCount}` },
                              { l: "Entities", v: `${result.metrics.entities}` },
                              { l: "Citations", v: `${result.metrics.citationsFound}` },
                            ].map((m) => (
                              <div key={m.l} className="bg-panel p-4">
                                <p className="font-mono text-[9px] tracking-[0.24em] text-dim uppercase">{m.l}</p>
                                <p className="mt-1 font-arch text-lg font-bold text-bone tabular-nums">{m.v}</p>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-2xl border border-line bg-panel p-5">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">llms.txt</span>
                              <span className={cn("rounded px-2 py-0.5 font-mono text-[9px] font-medium", result.llmsTxtStatus.exists ? "bg-lime/10 text-lime" : "bg-ember/10 text-ember")}>{result.llmsTxtStatus.exists ? "FOUND" : "MISSING"}</span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-mute">
                              {result.llmsTxtStatus.exists ? "Clean manifest detected — cuts token cost ~70%." : "No /llms.txt. Engines scrape verbose HTML/JS."}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-6">
                          <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-line bg-panel p-6">
                              <span className="font-mono text-[10px] tracking-[0.28em] text-dim uppercase">6-Axis Profile</span>
                              <Radar values={result.dimensions.map((d) => d.value)} labels={result.dimensions.map((d) => d.label.split(" ")[0])} />
                            </div>
                            <div className="rounded-2xl border border-line bg-panel p-6">
                              <span className="font-mono text-[10px] tracking-[0.28em] text-dim uppercase">Dimensions</span>
                              <div className="mt-5 flex flex-col gap-4">
                                {result.dimensions.map((d, i) => {
                                  const hue = d.value >= 75 ? "#c6ff4a" : d.value >= 50 ? "#ffb35c" : "#ff6b57";
                                  return (
                                    <div key={d.key}>
                                      <div className="mb-1 flex items-center justify-between gap-3">
                                        <span className="font-mono text-[11px] font-medium text-bone">{d.label}</span>
                                        <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: hue }}>{d.value}</span>
                                      </div>
                                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                                        <motion.div className="h-full rounded-full" style={{ backgroundColor: hue }} initial={{ width: 0 }} animate={{ width: `${d.value}%` }} transition={{ duration: 1, ease: EASE, delay: i * 0.08 }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-line bg-panel">
                            <div className="flex items-center justify-between border-b border-line px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-lime" />
                                <span className="font-mono text-[10px] tracking-[0.28em] text-dim uppercase">Priority plan</span>
                              </div>
                              <span className="font-mono text-[10px] text-lime">+{result.recommendations.reduce((a, b) => a + b.impactDelta, 0)} pts</span>
                            </div>
                            <div className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
                              {result.recommendations.map((rec, i) => (
                                <motion.div key={rec.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }} data-hover className={cn("p-6 transition-colors hover:bg-panel2", i % 2 === 1 && "md:border-l md:border-line")}>
                                  <div className="flex items-center justify-between">
                                    <span className={cn("rounded px-2 py-0.5 font-mono text-[9px] font-semibold", rec.priority.includes("P0") ? "bg-ember/15 text-ember" : rec.priority.includes("P1") ? "bg-amber/15 text-amber" : "bg-ice/15 text-ice")}>{rec.priority}</span>
                                    <span className="font-mono text-[10px] font-semibold text-lime">+{rec.impactDelta}</span>
                                  </div>
                                  <h4 className="mt-3 font-arch text-base font-semibold text-bone">{rec.title}</h4>
                                  <p className="mt-2 text-xs leading-relaxed text-mute">{rec.body}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "simulation" && (
                      <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {result.engines.map((e, i) => (
                            <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }} data-cursor="read" className="flex flex-col rounded-2xl border border-line bg-panel p-6" style={{ boxShadow: `inset 0 1px 0 0 ${e.color}22` }} onMouseEnter={() => sound.hover()}>
                              <div className="flex items-center justify-between border-b border-line pb-4">
                                <div className="flex items-center gap-3">
                                  <span className="rounded border px-2 py-1 font-mono text-[10px] font-semibold" style={{ color: e.color, borderColor: `${e.color}44`, backgroundColor: `${e.color}12` }}>{e.mono}</span>
                                  <h3 className="font-arch text-lg font-bold text-bone">{e.name}</h3>
                                </div>
                                <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium" style={{ color: e.color, backgroundColor: `${e.color}18` }}>{e.status === "LIKELY_TO_CITE" ? "CITES" : e.status === "CONDITIONAL" ? "CONDITIONAL" : "OMITTED"}</span>
                              </div>
                              <div className="mt-4 rounded-lg border border-line bg-ink/70 p-3">
                                <p className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">Prompt</p>
                                <p className="mt-1 text-xs italic text-bone/90">“{e.simulatedQuery}”</p>
                              </div>
                              <div className="mt-4 rounded-lg border border-line/60 bg-panel2 p-4">
                                <p className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">Output</p>
                                <p className="mt-2 whitespace-pre-line font-mono text-xs leading-relaxed text-bone/85">{e.simulatedOutput}</p>
                              </div>
                              <p className="mt-4 text-xs leading-relaxed text-mute">
                                <span className="font-medium" style={{ color: e.color }}>Why: </span>{e.explanation}
                              </p>
                              <div className="mt-auto border-t border-line pt-4">
                                <div className="mb-1.5 flex justify-between font-mono text-[10px] text-mute">
                                  <span>Citation probability</span>
                                  <span className="font-semibold" style={{ color: e.color }}>{e.probability}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                                  <motion.div className="h-full rounded-full" style={{ backgroundColor: e.color }} initial={{ width: 0 }} animate={{ width: `${e.probability}%` }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 + i * 0.08 }} />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "extraction" && (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-panel p-6">
                          <p className="max-w-2xl text-sm text-mute">{result.extraction.verdict}</p>
                          <div className="flex gap-6">
                            {[
                              { l: "Kept", v: `${result.extraction.keepRatio}%`, c: "#c6ff4a" },
                              { l: "Token budget", v: `${result.extraction.tokenBudgetUsed}/${result.extraction.tokenBudgetTotal}`, c: "#7fd7ff" },
                            ].map((m) => (
                              <div key={m.l}>
                                <p className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">{m.l}</p>
                                <p className="mt-1 font-arch text-xl font-bold tabular-nums" style={{ color: m.c }}>{m.v}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                          <div className="rounded-2xl border border-line bg-panel p-6">
                            <p className="mb-5 font-mono text-[10px] tracking-[0.28em] text-dim uppercase">Parsed by the retriever</p>
                            <div className="space-y-3">
                              {result.extraction.sentences.map((s, i) => {
                                const meta = EXTRACT_META[s.kind];
                                return (
                                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE, delay: i * 0.07 }} data-hover className="group flex gap-4 rounded-xl border border-line/70 bg-ink/50 p-4 transition-colors hover:border-line">
                                    <span className="mt-0.5 h-full w-0.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color, minHeight: 32 }} />
                                    <div className="min-w-0 flex-1">
                                      <p className={cn("font-mono text-xs leading-relaxed md:text-[13px]", s.kind === "fluff" ? "text-mute line-through decoration-ember/60" : "text-bone/90")}>{s.text}</p>
                                      <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.14em]" style={{ color: meta.color, backgroundColor: `${meta.color}15` }}>{meta.label}</span>
                                        <span className="font-mono text-[9px] text-dim">signal {s.signal}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-6">
                            <div className="rounded-2xl border border-line bg-panel p-6">
                              <p className="mb-4 font-mono text-[10px] tracking-[0.28em] text-dim uppercase">Legend</p>
                              <div className="space-y-3">
                                {(Object.keys(EXTRACT_META) as ExtractKind[]).map((k) => {
                                  const m = EXTRACT_META[k];
                                  const count = result.extraction.sentences.filter((s) => s.kind === k).length;
                                  return (
                                    <div key={k} className="flex items-start gap-3">
                                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                                      <div>
                                        <p className="font-mono text-[10px] font-semibold" style={{ color: m.color }}>{m.label}<span className="ml-2 text-dim">×{count}</span></p>
                                        <p className="text-[11px] leading-relaxed text-mute">{m.note}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-line bg-panel p-6">
                              <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-dim uppercase">Context window</p>
                              <div className="flex h-3 w-full overflow-hidden rounded-full bg-line">
                                <div className="h-full bg-lime transition-all duration-700" style={{ width: `${(result.extraction.tokenBudgetUsed / result.extraction.tokenBudgetTotal) * 100}%` }} />
                              </div>
                              <p className="mt-3 text-[11px] leading-relaxed text-mute">Only the highlighted content survives chunking. Struck-through lines are discarded.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "bots" && (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {result.botPermissions.map((bot, i) => (
                            <motion.div key={bot.botName} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }} data-hover data-cursor={bot.allowed ? "read" : "default"} onMouseEnter={() => (bot.allowed ? sound.hover() : sound.thud())} className={cn("rounded-2xl border bg-panel p-6 transition-colors", bot.allowed ? "border-line hover:border-lime/40" : "border-ember/35 bg-ember/[0.04]")}>
                              <div className="flex items-start justify-between border-b border-line pb-4">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-arch text-lg font-bold text-bone">{bot.botName}</h4>
                                    <span className="rounded bg-ink px-2 py-0.5 font-mono text-[9px] text-dim">{bot.useragent}</span>
                                  </div>
                                  <p className="mt-1 font-mono text-[11px] text-mute">{bot.engine}</p>
                                </div>
                                {bot.allowed ? (
                                  <span className="flex items-center gap-1.5 rounded-full bg-lime/15 px-3 py-1 font-mono text-[10px] font-semibold text-lime"><Check className="h-3 w-3" /> ALLOWED</span>
                                ) : (
                                  <span className="flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1 font-mono text-[10px] font-semibold text-ember"><ShieldAlert className="h-3 w-3" /> BLOCKED</span>
                                )}
                              </div>
                              <div className="mt-4 flex items-center justify-between font-mono text-[10px]">
                                <span className="text-dim uppercase">Impact</span>
                                <span className={cn("font-semibold", bot.impact === "CRITICAL" ? "text-ember" : "text-amber")}>{bot.impact}</span>
                              </div>
                              <p className="mt-3 text-xs leading-relaxed text-mute">{bot.recommendation}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "rewrite" && (
                      <div className="space-y-8">
                        <div className="rounded-2xl border border-line bg-panel p-6 md:p-8">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <span className="font-mono text-[10px] tracking-[0.24em] text-dim uppercase">Quotability rewrite</span>
                            <span className="rounded bg-lime/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-lime">+{result.contentTransformation.gainScore}% GAIN</span>
                          </div>
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-ember/30 bg-ember/[0.05] p-5">
                              <span className="rounded bg-ember/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-ember">Before</span>
                              <p className="mt-3 text-xs italic leading-relaxed text-bone/70">“{result.contentTransformation.before}”</p>
                              <div className="mt-4 border-t border-line pt-3 font-mono text-[10px] text-ember">✕ No proof · vague · unquotable</div>
                            </div>
                            <div className="rounded-xl border border-lime/40 bg-lime/[0.05] p-5">
                              <span className="rounded bg-lime/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-lime">After</span>
                              <p className="mt-3 text-xs font-medium leading-relaxed text-bone">“{result.contentTransformation.after}”</p>
                              <div className="mt-4 border-t border-line pt-3 font-mono text-[10px] text-lime">✓ Sample size · metric · SLA</div>
                            </div>
                          </div>
                          <button onClick={() => copy(result.contentTransformation.after, "rewrite", "Rewrite")} data-hover data-cursor="action" className="mt-6 flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-[10px] tracking-[0.16em] text-bone uppercase transition-colors hover:border-lime hover:text-lime">
                            {copiedKey === "rewrite" ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
                            Copy rewrite
                          </button>
                        </div>

                        <div>
                          <h3 className="mb-4 font-arch text-xl font-bold tracking-tight text-bone">Deploy artifacts</h3>
                          <div className="grid gap-6 lg:grid-cols-3">
                            {result.codeFixes.map((fix, i) => (
                              <motion.div key={fix.fileName} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }} className="rounded-2xl border border-line bg-panel p-6">
                                <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
                                  <div className="min-w-0">
                                    <h4 className="font-arch text-base font-bold text-bone">{fix.title}</h4>
                                    <span className="font-mono text-[10px] text-dim">{fix.fileName}</span>
                                  </div>
                                  <button onClick={() => copy(fix.code, fix.fileName, fix.fileName)} data-hover data-cursor="action" className={cn("flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 font-mono text-[10px] transition-colors", copiedKey === fix.fileName ? "bg-lime text-ink" : "bg-panel2 text-lime hover:bg-lime hover:text-ink")}>
                                    {copiedKey === fix.fileName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copiedKey === fix.fileName ? "Copied" : "Copy"}
                                  </button>
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-mute">{fix.benefit}</p>
                                <pre className="scrollbar-none mt-4 max-h-56 overflow-auto rounded-lg bg-ink p-3 font-mono text-[11px] leading-relaxed text-bone/80"><code>{fix.code}</code></pre>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "competitor" && (
                      <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="rounded-2xl border-2 border-lime/50 bg-panel p-8">
                            <span className="rounded bg-lime/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-lime">Your domain</span>
                            <h3 className="mt-3 break-all font-arch text-2xl font-bold text-bone">{result.host}</h3>
                            <div className="mt-6 flex items-baseline gap-2">
                              <span className="font-arch text-6xl font-bold text-bone tabular-nums">{result.score}</span>
                              <span className="font-mono text-sm text-dim">/ 100</span>
                            </div>
                            <p className="mt-6 border-t border-line pt-4 font-mono text-[11px] text-lime">+ {result.competitor.leaderArea}</p>
                          </div>
                          <div className="rounded-2xl border border-line bg-panel p-8">
                            <span className="rounded bg-bone/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-mute">Rival</span>
                            <h3 className="mt-3 break-all font-arch text-2xl font-bold text-bone">{result.competitor.competitorHost}</h3>
                            <div className="mt-6 flex items-baseline gap-2">
                              <span className="font-arch text-6xl font-bold text-mute tabular-nums">{result.competitor.competitorScore}</span>
                              <span className="font-mono text-sm text-dim">/ 100</span>
                            </div>
                            <p className="mt-6 border-t border-line pt-4 font-mono text-[11px] text-ember">! {result.competitor.vulnerabilityArea}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-panel2 p-6 md:flex-row">
                          <div>
                            <span className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Advantage</span>
                            <p className="mt-1 font-arch text-xl font-bold text-bone">
                              {result.competitor.gap >= 0 ? `+${result.competitor.gap} pts over ${result.competitor.competitorHost}` : `${result.competitor.gap} pts behind ${result.competitor.competitorHost}`}
                            </p>
                          </div>
                          <div className="w-full max-w-sm">
                            <div className="relative h-2 w-full rounded-full bg-line">
                              <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-y-1/2 bg-dim" />
                              <motion.div className={cn("absolute top-0 h-full rounded-full", result.competitor.gap >= 0 ? "bg-lime" : "bg-ember")} initial={{ width: 0 }} animate={{ width: `${Math.min(50, Math.abs(result.competitor.gap) * 1.6)}%`, left: result.competitor.gap >= 0 ? "50%" : undefined, right: result.competitor.gap >= 0 ? undefined : "50%" }} transition={{ duration: 1, ease: EASE, delay: 0.2 }} />
                            </div>
                            <p className="mt-2 text-center font-mono text-[10px] text-dim">“Which tool for enterprise deployment?”</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-lime/60 bg-ink px-5 py-2.5 font-mono text-xs text-lime shadow-2xl backdrop-blur-md">
            <Check className="h-4 w-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
