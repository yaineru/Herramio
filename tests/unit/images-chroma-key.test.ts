import { describe, it, expect } from "vitest";
import { removeColorBackground } from "@/lib/images/chroma-key";

function pixel(r: number, g: number, b: number, a = 255): number[] {
  return [r, g, b, a];
}

describe("removeColorBackground", () => {
  it("makes an exact color match fully transparent", () => {
    const data = new Uint8ClampedArray([...pixel(255, 255, 255)]);
    const out = removeColorBackground(data, { r: 255, g: 255, b: 255 }, 10);
    expect(out[3]).toBe(0);
  });

  it("leaves a very different color untouched", () => {
    const data = new Uint8ClampedArray([...pixel(20, 30, 40)]);
    const out = removeColorBackground(data, { r: 255, g: 255, b: 255 }, 10);
    expect(out[3]).toBe(255);
  });

  it("removes colors within tolerance and keeps colors outside it", () => {
    const data = new Uint8ClampedArray([...pixel(250, 250, 250), ...pixel(200, 200, 200)]);
    const out = removeColorBackground(data, { r: 255, g: 255, b: 255 }, 10);
    expect(out[3]).toBe(0); // (250,250,250) is within tolerance 10
    expect(out[7]).toBe(255); // (200,200,200) is far outside tolerance 10
  });

  it("does not modify the RGB channels, only alpha", () => {
    const data = new Uint8ClampedArray([...pixel(10, 20, 30)]);
    const out = removeColorBackground(data, { r: 10, g: 20, b: 30 }, 5);
    expect([out[0], out[1], out[2]]).toEqual([10, 20, 30]);
  });

  it("does not mutate the input array", () => {
    const data = new Uint8ClampedArray([...pixel(255, 255, 255)]);
    const copy = Uint8ClampedArray.from(data);
    removeColorBackground(data, { r: 255, g: 255, b: 255 }, 10);
    expect(data).toEqual(copy);
  });
});
