import { describe, it, expect } from "vitest";
import { pixelateRegion } from "@/lib/images/pixelate";

function makePixel(r: number, g: number, b: number, a = 255): number[] {
  return [r, g, b, a];
}

describe("pixelateRegion", () => {
  it("averages a 2x2 block into a single uniform color", () => {
    // 2x2 image: top-left black, others white, red, blue.
    const data = new Uint8ClampedArray([
      ...makePixel(0, 0, 0),
      ...makePixel(255, 255, 255),
      ...makePixel(255, 0, 0),
      ...makePixel(0, 0, 255),
    ]);
    const out = pixelateRegion(data, 2, 2, { x: 0, y: 0, width: 2, height: 2 }, 2);
    // Average of (0,0,0), (255,255,255), (255,0,0), (0,0,255) = (127.5,63.75,127.5) rounded.
    const expected = [128, 64, 128, 255];
    for (let i = 0; i < 4; i++) {
      expect(out[i * 4]).toBe(expected[0]);
      expect(out[i * 4 + 1]).toBe(expected[1]);
      expect(out[i * 4 + 2]).toBe(expected[2]);
      expect(out[i * 4 + 3]).toBe(expected[3]);
    }
  });

  it("leaves pixels outside the rect untouched", () => {
    const data = new Uint8ClampedArray([
      ...makePixel(10, 20, 30),
      ...makePixel(200, 100, 50),
    ]);
    const out = pixelateRegion(data, 2, 1, { x: 0, y: 0, width: 1, height: 1 }, 4);
    // Pixel 0 (inside the 1x1 rect) averages to itself; pixel 1 stays exactly as-is.
    expect([out[0], out[1], out[2], out[3]]).toEqual([10, 20, 30, 255]);
    expect([out[4], out[5], out[6], out[7]]).toEqual([200, 100, 50, 255]);
  });

  it("does not mutate the input array", () => {
    const data = new Uint8ClampedArray([...makePixel(1, 2, 3), ...makePixel(4, 5, 6)]);
    const copy = Uint8ClampedArray.from(data);
    pixelateRegion(data, 2, 1, { x: 0, y: 0, width: 2, height: 1 }, 2);
    expect(data).toEqual(copy);
  });

  it("clamps a rect that extends past the image bounds", () => {
    const data = new Uint8ClampedArray([
      ...makePixel(0, 0, 0),
      ...makePixel(255, 255, 255),
    ]);
    expect(() => pixelateRegion(data, 2, 1, { x: 1, y: 0, width: 10, height: 10 }, 2)).not.toThrow();
  });
});
