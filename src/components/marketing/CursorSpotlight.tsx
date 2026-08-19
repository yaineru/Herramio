"use client";

import { useEffect, useRef } from "react";
import { motionEffectsEnabled } from "@/lib/motion/preferences";
import { computeGlowPosition } from "@/lib/motion/motion-math";

/**
 * Ambient light that follows the cursor across the whole app — not a
 * custom cursor (the native one is untouched), just a very faint halo.
 * Fixed + pointer-events:none so it never intercepts clicks, and gated by
 * the same (pointer:fine, no reduced-motion) check as every other
 * mouse-driven effect, so it never mounts a listener on touch devices.
 */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionEffectsEnabled()) return;

    function handleMove(e: PointerEvent) {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const { mxPct, myPct } = computeGlowPosition(
          { x: e.clientX, y: e.clientY },
          { width: window.innerWidth, height: window.innerHeight },
        );
        el!.style.setProperty("--sx", `${mxPct}%`);
        el!.style.setProperty("--sy", `${myPct}%`);
        el!.style.setProperty("--spotlight-opacity", "1");
      });
    }

    function handleLeave() {
      el!.style.setProperty("--spotlight-opacity", "0");
    }

    window.addEventListener("pointermove", handleMove);
    document.documentElement.addEventListener("pointerleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 [--sx:50%] [--sy:50%] [--spotlight-opacity:0] motion-reduce:hidden"
      style={{
        opacity: "var(--spotlight-opacity)",
        transition: "opacity 400ms ease-out",
        background:
          "radial-gradient(600px circle at var(--sx) var(--sy), color-mix(in srgb, var(--color-emerald-400) 6%, transparent), transparent 70%)",
      }}
    />
  );
}
