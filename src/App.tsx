import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import Preloader from "./components/Preloader";
import BrandFlight, { type BrandPosition } from "./components/BrandFlight";
import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import Features from "./components/Features";
import EnginePlayground from "./components/EnginePlayground";
import SignalSandbox from "./components/SignalSandbox";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Analysis from "./components/Analysis";
import DocModal from "./components/DocModal";
import { initScroll, setScrollLock } from "./lib/scroll";
import { installAudioUnlock } from "./lib/sound";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [openingVisible, setOpeningVisible] = useState(true);
  const [brandFlying, setBrandFlying] = useState(false);
  const [brandFlight, setBrandFlight] = useState<{ from: BrandPosition; to: BrandPosition } | null>(null);
  const [auditUrl, setAuditUrl] = useState<string | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const brandMarkRef = useRef<HTMLSpanElement | null>(null);

  // Single Lenis instance for the whole app
  useEffect(() => initScroll(), []);

  // Unlock procedural audio on the first real user gesture
  useEffect(() => installAudioUnlock(), []);

  // One authoritative scroll-lock writer (no more competing overflow flags)
  useEffect(() => {
    setScrollLock(loading || openingVisible || !!brandFlight || !!auditUrl || docsOpen);
  }, [loading, openingVisible, brandFlight, auditUrl, docsOpen]);

  // Deep-link support: /?audit=https://…
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("audit");
    if (target) setAuditUrl(target);
  }, []);

  const openAudit = useCallback((url?: string) => {
    setAuditUrl(url ?? "https://www.stripe.com/pricing");
  }, []);

  const closeAudit = useCallback(() => setAuditUrl(null), []);

  const beginBrandFlight = useCallback((source: DOMRect) => {
    const target = brandMarkRef.current?.getBoundingClientRect();
    if (!target) {
      setLoading(false);
      return;
    }

    setBrandFlight({
      from: { left: source.left, top: source.top, width: source.width, height: source.height },
      to: { left: target.left, top: target.top, width: target.width, height: target.height },
    });
    setBrandFlying(true);
    setLoading(false);
  }, []);

  const finishBrandFlight = useCallback(() => {
    setBrandFlight(null);
    setBrandFlying(false);
  }, []);

  const finishOpening = useCallback(() => setOpeningVisible(false), []);
  const setBrandMark = useCallback((element: HTMLSpanElement | null) => {
    brandMarkRef.current = element;
  }, []);

  const started = !loading;

  return (
    <div className="noise relative min-h-svh bg-ink text-bone selection:bg-lime selection:text-ink">
      <Cursor />

      <AnimatePresence>
        {openingVisible && (
          <Preloader
            key="preloader"
            onReveal={beginBrandFlight}
            onExited={finishOpening}
          />
        )}
      </AnimatePresence>

      <Navbar
        started={started}
        onBrandMark={setBrandMark}
        brandFlying={brandFlying}
        onAudit={() => openAudit()}
        onOpenDocs={() => setDocsOpen(true)}
      />

      <AnimatePresence>
        {brandFlight && (
          <BrandFlight
            key="brand-flight"
            from={brandFlight.from}
            to={brandFlight.to}
            onComplete={finishBrandFlight}
          />
        )}
      </AnimatePresence>

      <main>
        <Hero started={started} onAnalyze={(url) => openAudit(url)} />
        <Marquee />
        <Manifesto />
        <Features />
        <div id="simulator">
          <EnginePlayground />
        </div>
        <SignalSandbox onAudit={() => openAudit()} />
        <div className="relative z-10 my-8 -rotate-[1.6deg] scale-[1.04] md:my-14">
          <Marquee reverse slow label="Crawled daily by GPTBot & PerplexityBot" />
        </div>
        <CTA onAudit={() => openAudit()} />
      </main>

      <Footer onOpenDocs={() => setDocsOpen(true)} />

      <AnimatePresence>
        {auditUrl && <Analysis key={auditUrl} initialUrl={auditUrl} onClose={closeAudit} />}
      </AnimatePresence>

      <DocModal isOpen={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
