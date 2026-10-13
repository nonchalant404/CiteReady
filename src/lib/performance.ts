/** Shared device-tier checks for decorative effects. */
export function isLowPowerDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrowScreen = window.innerWidth < 768;
  const limitedMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const limitedCores = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  const dataSaver = nav.connection?.saveData === true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return coarsePointer || narrowScreen || limitedMemory || limitedCores || dataSaver || reducedMotion;
}