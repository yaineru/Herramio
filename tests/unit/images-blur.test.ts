import { describe, it, expect } from "vitest";
import { blurRegion } from "@/lib/images/blur";

function pixel(r: number, g: number, b: number, a = 255): number[] {
  return [r, g, b, a];
}

describe("blurRegion", () => {
  it("leaves a uniform-color region unchanged", () => {
    const data = new Uint8ClampedArray([
      ...pixel(100, 100, 100),
      ...pixel(100, 100, 100),
      ...pixel(100, 100, 100),
      ...pixel(100, 100, 100),
    ]);
    const out = blurRegion(data, 2, 2, { x: 0, y: 0, width: 2, height: 2 }, 1);
    for (let i = 0; i < 4; i++) {
      expect([out[i * 4], out[i * 4 + 1], out[i * 4 + 2]]).toEqual([100, 100, 100]);
    }
  });

  it("averages a sharp edge into an intermediate value", () => {
    // Left column black, right column white, blur the whole 2x1 area.
    const data = new Uint8ClampedArray([...pixel(0, 0, 0), ...pixel(255, 255, 255)]);
    const out = blurRegion(data, 2, 1, { x: 0, y: 0, width: 2, height: 1 }, 1);
    // Each pixel's neighborhood includes both colors, so both should move toward the middle.
    expect(out[0]).toBeGreaterThan(0);
    expect(out[0]).toBeLessThan(255);
    expect(out[4]).toBeGreaterThan(0);
    expect(out[4]).toBeLessThan(255);
  });

  it("leaves pixels outside the rect untouched", () => {
    const data = new Uint8ClampedArray([...pixel(10, 20, 30), ...pixel(200, 100, 50)]);
    const out = blurRegion(data, 2, 1, { x: 0, y: 0, width: 1, height: 1 }, 1);
    expect([out[4], out[5], out[6], out[7]]).toEqual([200, 100, 50, 255]);
  });

  it("does not mutate the input array", () => {
    const data = new Uint8ClampedArray([...pixel(1, 2, 3), ...pixel(4, 5, 6)]);
    const copy = Uint8ClampedArray.from(data);
    blurRegion(data, 2, 1, { x: 0, y: 0, width: 2, height: 1 }, 1);
    expect(data).toEqual(copy);
  });
});
