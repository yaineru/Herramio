import { describe, it, expect } from "vitest";
import { constrainToAspect } from "@/lib/images/crop";

describe("constrainToAspect", () => {
  it("computes height from width for a square ratio", () => {
    const result = constrainToAspect({ x: 0, y: 0, width: 200, height: 999 }, 1);
    expect(result).toEqual({ x: 0, y: 0, width: 200, height: 200 });
  });

  it("computes height for a 16:9 ratio", () => {
    const result = constrainToAspect({ x: 10, y: 20, width: 400, height: 999 }, 16 / 9);
    expect(result.height).toBeCloseTo(225, 0);
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
  });

  it("computes a taller height for a portrait ratio", () => {
    const result = constrainToAspect({ x: 0, y: 0, width: 100, height: 999 }, 9 / 16);
    expect(result.height).toBeCloseTo(177.78, 1);
  });
});
