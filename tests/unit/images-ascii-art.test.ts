import { describe, it, expect } from "vitest";
import { imageDataToAscii } from "@/lib/images/ascii-art";

function solidColor(r: number, g: number, b: number, width: number, height: number, a = 255): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return data;
}

describe("imageDataToAscii", () => {
  it("renders a solid black image as the densest character throughout", () => {
    const data = solidColor(0, 0, 0, 4, 4);
    const ascii = imageDataToAscii(data, 4, 4, 10);
    const lines = ascii.split("\n");
    expect(lines.every((line) => [...line].every((ch) => ch === "@"))).toBe(true);
  });

  it("renders a solid white image as blank space", () => {
    const data = solidColor(255, 255, 255, 4, 4);
    const ascii = imageDataToAscii(data, 4, 4, 10);
    const lines = ascii.split("\n");
    expect(lines.every((line) => [...line].every((ch) => ch === " "))).toBe(true);
  });

  it("respects the requested column count", () => {
    const data = solidColor(128, 128, 128, 20, 20);
    const ascii = imageDataToAscii(data, 20, 20, 40);
    const lines = ascii.split("\n");
    expect(lines[0].length).toBe(40);
  });

  it("treats mostly-transparent pixels as blank space", () => {
    const data = solidColor(0, 0, 0, 4, 4, 0);
    const ascii = imageDataToAscii(data, 4, 4, 10);
    expect(ascii.split("\n").every((line) => [...line].every((ch) => ch === " "))).toBe(true);
  });

  it("clamps an absurdly large column request", () => {
    const data = solidColor(0, 0, 0, 4, 4);
    const ascii = imageDataToAscii(data, 4, 4, 10000);
    expect(ascii.split("\n")[0].length).toBe(300);
  });
});
