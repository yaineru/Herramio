"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionEffectsEnabled } from "@/lib/motion/preferences";
import { computeMagneticOffset } from "@/lib/motion/motion-math";

const MAX_OFFSET = 6;

/**
 * Wraps a button/link with a subtle magnetic pull toward the cursor.
 * Purely a presentational wrapper — pointer handling lives here so the
 * wrapped element (Button, Link) stays a plain, unmodified component.
 */
export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
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
        const offset = computeMagneticOffset(
          { x: e.clientX - rect.left, y: e.clientY - rect.top },
          rect,
          MAX_OFFSET,
        );
        el!.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
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
    <div ref={wrapperRef} className={`inline-block transition-transform duration-200 ease-out ${className ?? ""}`}>
      {children}
    </div>
  );
}
