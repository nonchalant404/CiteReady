import { useEffect, useRef } from "react";
import { isLowPowerDevice } from "../lib/performance";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hub: boolean;
}

/** Animated citation network on desktop; one static, light paint on mobile. */
export default function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let lowPower = isLowPowerDevice();
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999 };
    const linkDistance = 130;

    const seedNodes = () => {
      const count = lowPower
        ? Math.min(14, Math.max(8, Math.floor((width * height) / 42000)))
        : Math.min(90, Math.floor((width * height) / 16000));
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
        hub: index % (lowPower ? 5 : 11) === 0,
      }));
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          const limit = lowPower ? 105 : linkDistance;
          if (distance >= limit) continue;
          const alpha = (1 - distance / limit) * (lowPower ? 0.13 : 0.22);
          ctx.strokeStyle = `rgba(198,255,74,${alpha * (a.hub || b.hub ? 1 : 0.45)})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.hub ? node.r * 1.8 : node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.hub ? "rgba(198,255,74,0.78)" : "rgba(233,235,227,0.32)";
        ctx.fill();
        if (node.hub && !lowPower) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(198,255,74,0.12)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    };

    const frame = () => {
      raf = 0;
      if (lowPower || document.hidden) {
        running = false;
        return;
      }

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 26000 && distanceSquared > 100) {
          node.x += dx * 0.0006;
          node.y += dy * 0.0006;
        }
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }

      paint();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || lowPower || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      lowPower = isLowPowerDevice();
      const dpr = lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();

      if (lowPower) {
        stop();
        paint();
      } else {
        start();
      }
    };

    const onPointerMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    if (!lowPower) window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}