import { Asterisk } from "lucide-react";
import { cn } from "../utils/cn";

const ENGINES = [
  "CHATGPT",
  "PERPLEXITY",
  "GEMINI",
  "CLAUDE",
  "COPILOT",
  "AI OVERVIEWS",
  "GROK",
  "DEEPSEEK",
];

export default function Marquee({
  className,
  reverse = false,
  slow = false,
  label = "Tracked answer engines",
}: {
  className?: string;
  reverse?: boolean;
  slow?: boolean;
  label?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {ENGINES.map((e) => (
        <span key={e} className="flex items-center">
          <span className="px-6 font-arch font-expanded text-2xl font-semibold tracking-tight text-bone/90 md:px-10 md:text-4xl">
            {e}
          </span>
          <Asterisk className="h-5 w-5 shrink-0 text-lime md:h-7 md:w-7" strokeWidth={1.5} />
        </span>
      ))}
    </div>
  );

  return (
    <div
      data-cursor="drag"
      className={cn("relative border-y border-line bg-panel/40 py-6 md:py-8", className)}
    >
      <span className="absolute -top-2.5 left-5 z-10 bg-ink px-2 font-mono text-[9px] tracking-[0.3em] text-dim uppercase">
        {label}
      </span>
      <div className="mask-fade-x overflow-hidden">
        <div
          className={cn("flex w-max", slow ? "animate-marquee-slow" : "animate-marquee")}
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}
