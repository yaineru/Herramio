"use client";

import { useEffect, useRef, useState, Children, type ReactNode } from "react";
import { motionEffectsEnabled } from "@/lib/motion/preferences";
import { computeParallaxOffset } from "@/lib/motion/motion-math";

/**
 * "Universe of tools": a scattered grid whose cards drift very slightly
 * toward the cursor (parallax, layered by depth). Purely a positioning
 * wrapper — receives already-rendered card `children` from a Server
 * Component (see /experiencia/page.tsx) because those cards render a
 * Lucide icon component, which can't cross the Server→Client boundary as
 * a data prop (same reason ToolCard/TiltWrapper are split the same way).
 */
export function FloatingToolverse({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const items = Children.toArray(children);
  const depths = items.map((_, i) => 0.35 + (i % 3) * 0.3);
  const yOffsets = items.map((_, i) => (i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 6));

  // Cards cascade in one by one as the grid enters view, instead of all
  // popping in at once — cheap (opacity-only) so it never competes with the
  // pointer-driven parallax below for the same animation budget.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !motionEffectsEnabled()) return;

    function handleMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      scheduleFrame();
    }

    function handleLeave() {
      pointerRef.current = null;
      scheduleFrame();
    }

    function scheduleFrame() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(applyFrame);
    }

    function applyFrame() {
      rafRef.current = null;
      const rect = container!.getBoundingClientRect();
      const center = { x: rect.width / 2, y: rect.height / 2 };
      const pointer = pointerRef.current ?? center;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const offset = computeParallaxOffset(pointer, center, depths[i], 18);
        card.style.transform = `translate(${offset.x}px, ${offset.y + yOffsets[i]}px)`;
      });
    }

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className={`transition-[transform,opacity] duration-300 ease-out will-change-transform motion-reduce:transform-none motion-reduce:!opacity-100 motion-reduce:!transition-none ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translateY(${yOffsets[i]}px)`,
            transitionDelay: revealed ? `${(i % 6) * 60}ms` : "0ms",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
