import { describe, it, expect } from "vitest";
import { parseColor, rgbToHex, rgbToHsl, hslToRgb, rgbString, hslString } from "@/lib/dev/color";

describe("parseColor", () => {
  it("parses a 6-digit hex color", () => {
    expect(parseColor("#FF0000")).toEqual({ ok: true, rgb: { r: 255, g: 0, b: 0 } });
  });
  it("parses a 3-digit hex color by doubling each digit", () => {
    expect(parseColor("#f00")).toEqual({ ok: true, rgb: { r: 255, g: 0, b: 0 } });
  });
  it("parses hex without the leading #", () => {
    expect(parseColor("00ff00")).toEqual({ ok: true, rgb: { r: 0, g: 255, b: 0 } });
  });
  it("parses an rgb() string", () => {
    expect(parseColor("rgb(10, 20, 30)")).toEqual({ ok: true, rgb: { r: 10, g: 20, b: 30 } });
  });
  it("parses an rgba() string, ignoring alpha", () => {
    expect(parseColor("rgba(10, 20, 30, 0.5)")).toEqual({ ok: true, rgb: { r: 10, g: 20, b: 30 } });
  });
  it("parses an hsl() string", () => {
    const result = parseColor("hsl(0, 100%, 50%)");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });
  it("rejects an unrecognized format", () => {
    expect(parseColor("not a color").ok).toBe(false);
  });
  it("rejects rgb values over 255", () => {
    expect(parseColor("rgb(300, 0, 0)").ok).toBe(false);
  });
  it("rejects empty input", () => {
    expect(parseColor("").ok).toBe(false);
  });
});

describe("rgbToHex", () => {
  it("converts pure red", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#FF0000");
  });
  it("pads single-digit hex values with a leading zero", () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });
});

describe("rgbToHsl / hslToRgb round-trip", () => {
  it("converts red to hsl(0, 100%, 50%)", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });
  it("converts a gray (no saturation)", () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
  });
  it("round-trips rgb -> hsl -> rgb within rounding error", () => {
    const original = { r: 34, g: 139, b: 34 };
    const roundTripped = hslToRgb(rgbToHsl(original));
    expect(Math.abs(roundTripped.r - original.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(roundTripped.g - original.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(roundTripped.b - original.b)).toBeLessThanOrEqual(1);
  });
});

describe("rgbString / hslString", () => {
  it("formats an rgb() css string", () => {
    expect(rgbString({ r: 1, g: 2, b: 3 })).toBe("rgb(1, 2, 3)");
  });
  it("formats an hsl() css string", () => {
    expect(hslString({ h: 120, s: 50, l: 25 })).toBe("hsl(120, 50%, 25%)");
  });
});
