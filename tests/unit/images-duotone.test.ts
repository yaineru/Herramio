import { describe, it, expect } from "vitest";
import { applyDuotoneEffect } from "@/lib/images/duotone";

describe("applyDuotoneEffect", () => {
  const colorA = { r: 10, g: 20, b: 30 }; // shadows
  const colorB = { r: 200, g: 210, b: 220 }; // highlights

  it("maps pure black pixels to colorA", () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255]);
    const out = applyDuotoneEffect(data, colorA, colorB);
    expect(Array.from(out)).toEqual([10, 20, 30, 255]);
  });

  it("maps pure white pixels to colorB", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    const out = applyDuotoneEffect(data, colorA, colorB);
    expect(out[0]).toBeCloseTo(200, 0);
    expect(out[1]).toBeCloseTo(210, 0);
    expect(out[2]).toBeCloseTo(220, 0);
  });

  it("interpolates mid-gray pixels between the two colors", () => {
    const data = new Uint8ClampedArray([128, 128, 128, 255]);
    const out = applyDuotoneEffect(data, colorA, colorB);
    expect(out[0]).toBeGreaterThan(colorA.r);
    expect(out[0]).toBeLessThan(colorB.r);
  });

  it("preserves the alpha channel", () => {
    const data = new Uint8ClampedArray([100, 100, 100, 128]);
    const out = applyDuotoneEffect(data, colorA, colorB);
    expect(out[3]).toBe(128);
  });
});
