import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const TEXT =
  "Ranking is over. Answer engines don't list ten links — they synthesize one answer and cite two or three sources. GEO is the discipline of being the source.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const color = useTransform(progress, range, ["#3a3e38", "#e9ebe3"]);
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.82", "end 0.42"] });
  const words = TEXT.split(" ");

  return (
    <section id="engine" className="relative px-5 py-28 md:px-10 md:py-44">
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-x-6 gap-y-10">
        {/* margin column: oversized index number */}
        <div className="col-span-12 md:col-span-3">
          <div className="md:sticky md:top-32">
            <span className="block font-arch font-expanded text-[clamp(5rem,13vw,12rem)] font-bold leading-[0.8] text-stroke">
              01
            </span>
            <p className="mt-5 flex items-center gap-3 font-mono text-[12px] tracking-[0.28em] text-mute uppercase">
              <span className="h-px w-8 bg-lime" />
              The Thesis
            </p>
          </div>
        </div>

        {/* statement pushed into the right two-thirds, dropped below the number */}
        <div ref={ref} className="col-span-12 md:col-span-9 md:pt-24 lg:col-span-8 lg:col-start-5">
          <p className="font-arch text-[clamp(1.8rem,3.9vw,3.7rem)] font-medium leading-[1.16] tracking-[-0.015em]">
            {words.map((w, i) => (
              <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
            ))}
          </p>
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 block h-px w-full origin-left bg-line"
          />
        </div>
      </div>
    </section>
  );
}
