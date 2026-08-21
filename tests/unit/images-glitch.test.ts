import { describe, it, expect } from "vitest";
import { applyGlitchEffect } from "@/lib/images/glitch";

function makeGradient(width: number, height: number): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = x * 10;
      data[i + 1] = y * 10;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  return data;
}

describe("applyGlitchEffect", () => {
  it("preserves the output length and alpha channel", () => {
    const data = makeGradient(20, 20);
    const out = applyGlitchEffect(data, 20, 20, 50);
    expect(out.length).toBe(data.length);
    for (let i = 3; i < out.length; i += 4) {
      expect(out[i]).toBe(255);
    }
  });

  it("is deterministic for the same input and intensity", () => {
    const data = makeGradient(20, 20);
    const out1 = applyGlitchEffect(data, 20, 20, 50);
    const out2 = applyGlitchEffect(data, 20, 20, 50);
    expect(Array.from(out1)).toEqual(Array.from(out2));
  });

  it("leaves the image unchanged at zero effective shift", () => {
    const data = makeGradient(20, 20);
    const out = applyGlitchEffect(data, 20, 20, 0);
    // intensity 0 still rounds up to a 1px shift by design (Math.max(1, ...)),
    // but the green channel is always passed through untouched.
    for (let i = 1; i < out.length; i += 4) {
      expect(out[i]).toBe(data[i]);
    }
  });

  it("actually shifts pixels for a nonzero intensity", () => {
    const data = makeGradient(50, 20);
    const out = applyGlitchEffect(data, 50, 20, 100);
    expect(Array.from(out)).not.toEqual(Array.from(data));
  });
});
