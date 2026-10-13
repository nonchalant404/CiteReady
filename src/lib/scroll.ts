import Lenis from "lenis";

/**
 * Single source of truth for scrolling.
 * Fixes the previous conflicts:
 *   • window.scrollTo() fighting Lenis  → use scrollToTop()/scrollToTarget()
 *   • duplicate body-overflow writers   → use setScrollLock() only
 */

let lenis: Lenis | null = null;
let rafId = 0;
let locked = false;

function requestFrame() {
  if (!lenis || locked || rafId) return;
  rafId = requestAnimationFrame(runFrame);
}

function runFrame(time: number) {
  rafId = 0;
  if (!lenis || locked) return;
  lenis.raf(time);
  if (lenis.isScrolling) requestFrame();
}

export function initScroll(): () => void {
  if (lenis) return () => {};

  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => 1 - Math.pow(1 - t, 3.5),
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.2,
    infinite: false,
  });

  // Run Lenis only during an active scroll instead of burning a frame at idle.
  const wake = () => requestFrame();
  window.addEventListener("wheel", wake, { passive: true });
  window.addEventListener("touchstart", wake, { passive: true });
  window.addEventListener("touchmove", wake, { passive: true });
  window.addEventListener("scroll", wake, { passive: true });

  // Keep native anchor links working through Lenis instead of jumping.
  const onClick = (e: MouseEvent) => {
    if (!lenis || locked) return;
    const target = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!target) return;
    const id = target.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.5 });
    requestFrame();
  };
  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("wheel", wake);
    window.removeEventListener("touchstart", wake);
    window.removeEventListener("touchmove", wake);
    window.removeEventListener("scroll", wake);
    cancelAnimationFrame(rafId);
    lenis?.destroy();
    lenis = null;
  };
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function scrollToTop() {
  if (locked) return;
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.6 });
    requestFrame();
  }
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function scrollToTarget(selector: string) {
  if (locked || !lenis) return;
  const el = document.querySelector(selector);
  if (el) {
    lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.5 });
    requestFrame();
  }
}

/** Locks page scroll for overlays/modals without fighting Lenis internals. */
export function setScrollLock(next: boolean) {
  locked = next;
  if (!lenis) return;
  if (next) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lenis.stop();
    document.documentElement.classList.add("is-locked");
  } else {
    lenis.start();
    document.documentElement.classList.remove("is-locked");
  }
}

export function isScrollLocked(): boolean {
  return locked;
}
