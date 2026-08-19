export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  width: number;
  height: number;
}

/** Pointer position as a percentage of the container, for the CSS radial-gradient center. */
export function computeGlowPosition(pointer: Point, rect: Rect): { mxPct: number; myPct: number } {
  const width = rect.width || 1;
  const height = rect.height || 1;
  return {
    mxPct: (pointer.x / width) * 100,
    myPct: (pointer.y / height) * 100,
  };
}

/** 0 (far/at-or-beyond radius) to 1 (right on top of the node), linear falloff. */
export function computeProximity(pointer: Point, node: Point, radius: number): number {
  if (radius <= 0) return 0;
  const dist = Math.hypot(pointer.x - node.x, pointer.y - node.y);
  return Math.max(0, 1 - dist / radius);
}

/** Maps a 0-1 proximity value to the node's scale and opacity for the constellation effect. */
export function nodeStyleForProximity(proximity: number): { scale: number; opacity: number } {
  const clamped = Math.max(0, Math.min(1, proximity));
  return {
    scale: 1 + clamped * 0.4,
    opacity: 0.35 + clamped * 0.5,
  };
}

/**
 * Pointer position within a card (0-1 on each axis) mapped to a subtle tilt
 * angle, in degrees. maxDeg caps how far the card can rotate — kept small
 * (see TILT_MAX_DEG in TiltCard) so this reads as a premium hover detail,
 * not a gimmick.
 */
export function computeTilt(pointer: Point, rect: Rect, maxDeg: number): { rotateX: number; rotateY: number } {
  const width = rect.width || 1;
  const height = rect.height || 1;
  const px = pointer.x / width - 0.5;
  const py = pointer.y / height - 0.5;
  return {
    rotateX: -py * 2 * maxDeg,
    rotateY: px * 2 * maxDeg,
  };
}

/** Clamps a magnetic-button offset to a maximum displacement in pixels. */
export function computeMagneticOffset(pointer: Point, rect: Rect, maxOffset: number): Point {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const dx = pointer.x - centerX;
  const dy = pointer.y - centerY;
  return {
    x: Math.max(-maxOffset, Math.min(maxOffset, dx * 0.35)),
    y: Math.max(-maxOffset, Math.min(maxOffset, dy * 0.35)),
  };
}

/**
 * Layered parallax offset for a "floating cards" scene: how far a card at
 * a given `depth` (0 = static background, 1 = closest/most reactive)
 * should shift toward the pointer, clamped to `maxOffset` px. Pointer and
 * container center are both in the same coordinate space (e.g. viewport).
 */
export function computeParallaxOffset(pointer: Point, containerCenter: Point, depth: number, maxOffset: number): Point {
  const clampedDepth = Math.max(0, Math.min(1, depth));
  const dx = pointer.x - containerCenter.x;
  const dy = pointer.y - containerCenter.y;
  const factor = clampedDepth * 0.04;
  return {
    x: Math.max(-maxOffset, Math.min(maxOffset, dx * factor)),
    y: Math.max(-maxOffset, Math.min(maxOffset, dy * factor)),
  };
}
