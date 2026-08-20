import { describe, it, expect } from "vitest";
import { extractPalette } from "@/lib/images/color-palette";

function pixel(r: number, g: number, b: number, a = 255): number[] {
  return [r, g, b, a];
}

describe("extractPalette", () => {
  it("ranks the most frequent color first", () => {
    // 3 red pixels, 1 blue pixel.
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(255, 0, 0),
      ...pixel(255, 0, 0),
      ...pixel(0, 0, 255),
    ]);
    const palette = extractPalette(data, 5);
    expect(palette[0].hex).toBe("#FF0000");
    expect(palette[0].percentage).toBe(75);
    expect(palette[1].hex).toBe("#0000FF");
    expect(palette[1].percentage).toBe(25);
  });

  it("limits results to the requested count", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(0, 255, 0),
      ...pixel(0, 0, 255),
    ]);
    expect(extractPalette(data, 2)).toHaveLength(2);
  });

  it("ignores mostly-transparent pixels", () => {
    const data = new Uint8ClampedArray([
      ...pixel(255, 0, 0),
      ...pixel(0, 255, 0, 5),
    ]);
    const palette = extractPalette(data, 5);
    expect(palette).toHaveLength(1);
    expect(palette[0].hex).toBe("#FF0000");
  });

  it("returns an empty array for a fully transparent image", () => {
    const data = new Uint8ClampedArray([...pixel(255, 0, 0, 0)]);
    expect(extractPalette(data, 5)).toEqual([]);
  });

  it("groups near-identical shades into the same bucket", () => {
    const data = new Uint8ClampedArray([...pixel(100, 100, 100), ...pixel(102, 99, 101)]);
    const palette = extractPalette(data, 5);
    expect(palette).toHaveLength(1);
    expect(palette[0].percentage).toBe(100);
  });
});
