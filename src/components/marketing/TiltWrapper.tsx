"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEffectsEnabled } from "@/lib/motion/preferences";
import { computeTilt } from "@/lib/motion/motion-math";

const TILT_MAX_DEG = 6;

/**
 * Client-only pointer wrapper around server-rendered card content. Kept
 * separate from ToolCard (a Server Component) because ToolCard's `tool`
 * prop carries a Lucide icon component reference — functions can't cross
 * the Server→Client boundary as props, but pre-rendered `children` can.
 */
export function TiltWrapper({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !motionEffectsEnabled()) return;

    function handleMove(e: PointerEvent) {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = el!.getBoundingClientRect();
        const { rotateX, rotateY } = computeTilt(
          { x: e.clientX - rect.left, y: e.clientY - rect.top },
          rect,
          TILT_MAX_DEG,
        );
        el!.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });
    }

    function handleLeave() {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      el!.style.transform = "";
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="h-full transition-transform duration-200 ease-out will-change-transform">
      {children}
    </div>
  );
}
