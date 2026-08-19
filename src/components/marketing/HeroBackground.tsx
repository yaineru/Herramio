"use client";

import { useEffect, useRef } from "react";
import { QrCode, FileText, Image as ImageIcon, Calculator, RefreshCw, Type, Code2, Zap } from "lucide-react";
import { motionEffectsEnabled } from "@/lib/motion/preferences";
import { computeProximity, nodeStyleForProximity } from "@/lib/motion/motion-math";

// Sparse, hand-placed "constellation" of category icons — deliberately few
// and off to the sides so they never compete with the headline/search bar
// that sits on top of them. The ambient cursor glow itself lives in
// CursorSpotlight (mounted once in the root layout) — this component only
// owns the dot grid and the icons' proximity reaction, to avoid stacking
// two overlapping radial-gradient glows in the same area.
const NODES = [
  { Icon: QrCode, top: "18%", left: "8%" },
  { Icon: FileText, top: "72%", left: "12%" },
  { Icon: ImageIcon, top: "12%", left: "88%" },
  { Icon: Calculator, top: "80%", left: "90%" },
  { Icon: RefreshCw, top: "40%", left: "5%" },
  { Icon: Type, top: "55%", left: "95%" },
  { Icon: Code2, top: "88%", left: "45%" },
  { Icon: Zap, top: "10%", left: "45%" },
];

const PROXIMITY_RADIUS = 260;

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !motionEffectsEnabled()) return;

    function handlePointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      scheduleFrame();
    }

    function handlePointerLeave() {
      pointerRef.current = null;
      scheduleFrame();
    }

    function scheduleFrame() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(applyFrame);
    }

    function applyFrame() {
      rafRef.current = null;
      const pointer = pointerRef.current;

      nodeRefs.current.forEach((node) => {
        if (!node) return;
        if (!pointer) {
          node.style.transform = "scale(1)";
          node.style.opacity = "";
          return;
        }
        const nodeCenter = { x: node.offsetLeft + node.offsetWidth / 2, y: node.offsetTop + node.offsetHeight / 2 };
        const proximity = computeProximity(pointer, nodeCenter, PROXIMITY_RADIUS);
        const { scale, opacity } = nodeStyleForProximity(proximity);
        node.style.transform = `scale(${scale})`;
        node.style.opacity = String(opacity);
      });
    }

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--color-slate-400) 35%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 90%)",
        }}
      />
      {NODES.map(({ Icon, top, left }, i) => (
        <div
          key={i}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-white/80 opacity-35 shadow-sm backdrop-blur-sm transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ top, left }}
        >
          <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}
