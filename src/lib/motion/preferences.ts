/** True when the OS/browser is capable of hover + fine pointer (mouse/trackpad, not touch). */
export function prefersFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine) and (hover: hover)").matches;
}

/** True when the user has requested reduced motion at the OS level. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Whether interactive mouse-driven effects (tilt, magnetic, parallax) should run at all. */
export function motionEffectsEnabled(): boolean {
  return prefersFinePointer() && !prefersReducedMotion();
}
