import { describe, it, expect } from "vitest";
import { convertUnits } from "@/lib/converters/units";

describe("convertUnits — longitud", () => {
  it("converts km to millas", () => {
    expect(convertUnits("longitud", "km", "mi", 1)).toBeCloseTo(0.621371, 5);
  });
  it("converts m to ft", () => {
    expect(convertUnits("longitud", "m", "ft", 1)).toBeCloseTo(3.28084, 4);
  });
  it("round-trips cm to m and back", () => {
    const m = convertUnits("longitud", "cm", "m", 250)!;
    expect(m).toBeCloseTo(2.5, 5);
    expect(convertUnits("longitud", "m", "cm", m)).toBeCloseTo(250, 5);
  });
});

describe("convertUnits — peso", () => {
  it("converts kg to lb", () => {
    expect(convertUnits("peso", "kg", "lb", 1)).toBeCloseTo(2.20462, 4);
  });
  it("converts lb to kg", () => {
    expect(convertUnits("peso", "lb", "kg", 1)).toBeCloseTo(0.453592, 5);
  });
});

describe("convertUnits — temperatura", () => {
  it("converts 0°C to 32°F", () => {
    expect(convertUnits("temperatura", "c", "f", 0)).toBeCloseTo(32, 5);
  });
  it("converts 100°C to 212°F", () => {
    expect(convertUnits("temperatura", "c", "f", 100)).toBeCloseTo(212, 5);
  });
  it("converts 0°C to 273.15K", () => {
    expect(convertUnits("temperatura", "c", "k", 0)).toBeCloseTo(273.15, 5);
  });
  it("converts 32°F to 0°C", () => {
    expect(convertUnits("temperatura", "f", "c", 32)).toBeCloseTo(0, 5);
  });
  it("converts absolute zero from K to C", () => {
    expect(convertUnits("temperatura", "k", "c", 0)).toBeCloseTo(-273.15, 5);
  });
  it("returns the same value for identical units", () => {
    expect(convertUnits("temperatura", "c", "c", 37)).toBe(37);
  });
});

describe("convertUnits — area, volumen, tiempo", () => {
  it("converts m2 to ha", () => {
    expect(convertUnits("area", "m2", "ha", 10000)).toBeCloseTo(1, 5);
  });
  it("converts liters to galones", () => {
    expect(convertUnits("volumen", "l", "gal", 3.785411784)).toBeCloseTo(1, 5);
  });
  it("converts hours to minutes", () => {
    expect(convertUnits("tiempo", "h", "min", 2)).toBe(120);
  });
});

describe("convertUnits — edge cases", () => {
  it("returns null for NaN input", () => {
    expect(convertUnits("longitud", "m", "km", NaN)).toBeNull();
  });
  it("returns null for unknown unit ids", () => {
    expect(convertUnits("longitud", "m", "parsecs", 1)).toBeNull();
  });
  it("handles zero correctly", () => {
    expect(convertUnits("longitud", "m", "km", 0)).toBe(0);
  });
});
