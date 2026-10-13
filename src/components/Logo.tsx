/**
 * The CiteReady logo mark: a citation ring — thin outer ring, a spinning
 * dashed lime arc, an inner ring, and a solid center dot.
 * Used in the navbar, footer, and as the hero of the interactive opening.
 */
export function LogoMark({
  size = 28,
  className = "",
  onElement,
  hidden = false,
}: {
  size?: number | string;
  className?: string;
  onElement?: (element: HTMLSpanElement | null) => void;
  hidden?: boolean;
}) {
  return (
    <span
      ref={onElement}
      className="inline-flex shrink-0 items-center justify-center text-lime"
      style={{
        width: size,
        height: size,
        opacity: hidden ? 0 : 1,
        transition: hidden ? "none" : "opacity 180ms ease-out",
      }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" className={className}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#c6ff4a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="150 94"
          className="logo-mark-orbit animate-spin-slow"
          style={{ transformOrigin: "center" }}
        />
        <circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
        <circle cx="50" cy="50" r="5.5" fill="#c6ff4a" />
      </svg>
    </span>
  );
}

export function LogoWordmark({
  size = 26,
  onMarkElement,
  hideMark = false,
}: {
  size?: number;
  onMarkElement?: (element: HTMLSpanElement | null) => void;
  hideMark?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-2">
      <LogoMark size={size} onElement={onMarkElement} hidden={hideMark} />
      <span className="font-arch text-[17px] font-semibold tracking-tight text-bone">Cite</span>
      <span className="font-serif italic text-[19px] leading-none text-lime">Ready</span>
      <span className="align-super font-mono text-[9px] text-dim">®</span>
    </span>
  );
}
