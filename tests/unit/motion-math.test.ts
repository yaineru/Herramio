import { describe, it, expect } from "vitest";
import {
  computeGlowPosition,
  computeProximity,
  nodeStyleForProximity,
  computeTilt,
  computeMagneticOffset,
  computeParallaxOffset,
} from "@/lib/motion/motion-math";

describe("computeGlowPosition", () => {
  it("converts pointer position to percentages of the container", () => {
    expect(computeGlowPosition({ x: 100, y: 50 }, { width: 400, height: 200 })).toEqual({ mxPct: 25, myPct: 25 });
  });
  it("handles the pointer at the top-left corner", () => {
    expect(computeGlowPosition({ x: 0, y: 0 }, { width: 400, height: 200 })).toEqual({ mxPct: 0, myPct: 0 });
  });
  it("handles the pointer at the bottom-right corner", () => {
    expect(computeGlowPosition({ x: 400, y: 200 }, { width: 400, height: 200 })).toEqual({ mxPct: 100, myPct: 100 });
  });
  it("does not divide by zero for a zero-size container", () => {
    const result = computeGlowPosition({ x: 10, y: 10 }, { width: 0, height: 0 });
    expect(Number.isFinite(result.mxPct)).toBe(true);
    expect(Number.isFinite(result.myPct)).toBe(true);
  });
});

describe("computeProximity", () => {
  it("returns 1 when the pointer is exactly on the node", () => {
    expect(computeProximity({ x: 50, y: 50 }, { x: 50, y: 50 }, 100)).toBe(1);
  });
  it("returns 0 at or beyond the radius", () => {
    expect(computeProximity({ x: 0, y: 0 }, { x: 100, y: 0 }, 100)).toBe(0);
    expect(computeProximity({ x: 0, y: 0 }, { x: 200, y: 0 }, 100)).toBe(0);
  });
  it("falls off linearly with distance", () => {
    expect(computeProximity({ x: 0, y: 0 }, { x: 50, y: 0 }, 100)).toBeCloseTo(0.5, 5);
  });
  it("returns 0 for a zero radius instead of dividing by zero", () => {
    expect(computeProximity({ x: 0, y: 0 }, { x: 0, y: 0 }, 0)).toBe(0);
  });
});

describe("nodeStyleForProximity", () => {
  it("maps 0 proximity to the resting scale and base opacity", () => {
    expect(nodeStyleForProximity(0)).toEqual({ scale: 1, opacity: 0.35 });
  });
  it("maps 1 proximity to the maximum scale and opacity", () => {
    expect(nodeStyleForProximity(1)).toEqual({ scale: 1.4, opacity: 0.85 });
  });
  it("clamps out-of-range input", () => {
    expect(nodeStyleForProximity(-1)).toEqual({ scale: 1, opacity: 0.35 });
    expect(nodeStyleForProximity(2)).toEqual({ scale: 1.4, opacity: 0.85 });
  });
});

describe("computeTilt", () => {
  it("returns no tilt when the pointer is at the exact center", () => {
    expect(computeTilt({ x: 100, y: 50 }, { width: 200, height: 100 }, 8)).toEqual({ rotateX: -0, rotateY: 0 });
  });
  it("tilts up (negative rotateX) when the pointer is above center", () => {
    const { rotateX } = computeTilt({ x: 100, y: 0 }, { width: 200, height: 100 }, 8);
    expect(rotateX).toBeGreaterThan(0);
  });
  it("tilts right (positive rotateY) when the pointer is right of center", () => {
    const { rotateY } = computeTilt({ x: 200, y: 50 }, { width: 200, height: 100 }, 8);
    expect(rotateY).toBeGreaterThan(0);
  });
  it("never exceeds maxDeg at the corners", () => {
    const { rotateX, rotateY } = computeTilt({ x: 200, y: 0 }, { width: 200, height: 100 }, 8);
    expect(Math.abs(rotateX)).toBeLessThanOrEqual(8);
    expect(Math.abs(rotateY)).toBeLessThanOrEqual(8);
  });
});

describe("computeMagneticOffset", () => {
  it("returns no offset when the pointer is at the exact center", () => {
    expect(computeMagneticOffset({ x: 50, y: 25 }, { width: 100, height: 50 }, 6)).toEqual({ x: 0, y: 0 });
  });
  it("moves toward the pointer, scaled down", () => {
    const result = computeMagneticOffset({ x: 60, y: 25 }, { width: 100, height: 50 }, 6);
    expect(result.x).toBeGreaterThan(0);
    expect(result.x).toBeLessThan(10);
  });
  it("clamps to maxOffset even for a pointer far outside the element", () => {
    const result = computeMagneticOffset({ x: 1000, y: 1000 }, { width: 100, height: 50 }, 6);
    expect(result.x).toBe(6);
    expect(result.y).toBe(6);
  });
});

describe("computeParallaxOffset", () => {
  it("returns no offset when the pointer is at the container center", () => {
    expect(computeParallaxOffset({ x: 500, y: 400 }, { x: 500, y: 400 }, 1, 20)).toEqual({ x: 0, y: 0 });
  });
  it("depth 0 (background) never moves regardless of pointer position", () => {
    expect(computeParallaxOffset({ x: 900, y: 900 }, { x: 500, y: 400 }, 0, 20)).toEqual({ x: 0, y: 0 });
  });
  it("deeper (closer) cards move more than shallow ones for the same pointer", () => {
    const shallow = computeParallaxOffset({ x: 700, y: 400 }, { x: 500, y: 400 }, 0.2, 20);
    const deep = computeParallaxOffset({ x: 700, y: 400 }, { x: 500, y: 400 }, 1, 20);
    expect(Math.abs(deep.x)).toBeGreaterThan(Math.abs(shallow.x));
  });
  it("clamps to maxOffset for a pointer far from center", () => {
    const result = computeParallaxOffset({ x: 5000, y: 5000 }, { x: 0, y: 0 }, 1, 20);
    expect(result.x).toBe(20);
    expect(result.y).toBe(20);
  });
  it("clamps depth to the 0-1 range", () => {
    const overDepth = computeParallaxOffset({ x: 700, y: 400 }, { x: 500, y: 400 }, 5, 20);
    const maxDepth = computeParallaxOffset({ x: 700, y: 400 }, { x: 500, y: 400 }, 1, 20);
    expect(overDepth).toEqual(maxDepth);
  });
});
