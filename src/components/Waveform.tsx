import { useEffect, useRef } from "react";
import { sound } from "../lib/sound";
import { isLowPowerDevice } from "../lib/performance";

/**
 * Live oscilloscope driven by the audio engine's AnalyserNode.
 * Falls back to a synthesized idle wave when audio is muted/locked,
 * so the element always feels alive.
 */
export default function Waveform({
  className,
  color = "#c6ff4a",
  bars = 72,
  idle = false,
}: {
  className?: string;
  color?: string;
  bars?: number;
  idle?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lowPower = isLowPowerDevice();
    const drawBars = lowPower ? Math.min(28, bars) : bars;
    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;

    const resize = () => {
      const dpr = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const data = new Uint8Array(1024);

    const draw = () => {
      t += 0.045;
      ctx.clearRect(0, 0, w, h);

      const analyser = idle ? null : sound.getAnalyser();
      const live = analyser && sound.enabled;

      const slot = w / drawBars;
      const barW = Math.max(1.5, slot * 0.42);

      if (live && analyser) {
        analyser.getByteTimeDomainData(data);
      }

      for (let i = 0; i < drawBars; i++) {
        const p = i / (drawBars - 1);
        let amp: number;

        if (live && analyser) {
          const idx = Math.floor(p * (analyser.fftSize * 0.5)) + 4;
          amp = (data[idx] - 128) / 128;
          // envelope so edges taper instead of clipping hard
          const taper = Math.sin(p * Math.PI);
          amp = amp * taper;
        } else {
          // synthesized idle wave — three harmonics drifting
          const taper = Math.sin(p * Math.PI);
          amp =
            (Math.sin(p * 9 + t * 1.7) * 0.42 +
              Math.sin(p * 21 - t * 2.3) * 0.24 +
              Math.sin(p * 4.5 + t * 0.9) * 0.3) *
            taper *
            0.42;
        }

        const bh = Math.max(1.5, Math.abs(amp) * h * 0.86);
        const cx = i * slot + slot / 2;
        const cy = h / 2;

        const alpha = 0.28 + Math.min(1, Math.abs(amp) * 2.4) * 0.72;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        const rx = cx - barW / 2;
        const ry = cy - bh / 2;
        if (typeof ctx.roundRect === "function") {
          ctx.beginPath();
          ctx.roundRect(rx, ry, barW, bh, Math.min(barW / 2, bh / 2));
          ctx.fill();
        } else {
          ctx.fillRect(rx, ry, barW, bh);
        }
      }

      ctx.globalAlpha = 1;
      if (!lowPower && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      if (lowPower) draw();
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!lowPower && !raf) draw();
    };

    resize();
    draw();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, bars, idle]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
