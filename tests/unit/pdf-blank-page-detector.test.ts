import { describe, it, expect } from "vitest";
import { isImageDataBlank } from "@/lib/pdf/blank-page-detector";

function solidColor(r: number, g: number, b: number, pixels: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(pixels * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  return data;
}

describe("isImageDataBlank", () => {
  it("treats a solid white image as blank", () => {
    expect(isImageDataBlank(solidColor(255, 255, 255, 100))).toBe(true);
  });

  it("treats a solid black image as not blank", () => {
    expect(isImageDataBlank(solidColor(0, 0, 0, 100))).toBe(false);
  });

  it("treats an image with a single dark pixel as not blank", () => {
    const data = solidColor(255, 255, 255, 100);
    data[40] = 0; // darken the R channel of one pixel
    expect(isImageDataBlank(data)).toBe(false);
  });

  it("respects the threshold", () => {
    const data = solidColor(252, 252, 252, 50);
    expect(isImageDataBlank(data, 250)).toBe(true);
    expect(isImageDataBlank(data, 253)).toBe(false);
  });
});
