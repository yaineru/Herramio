import { describe, it, expect } from "vitest";
import { buildFilterString, DEFAULT_FILTER_SETTINGS } from "@/lib/images/filters";

describe("buildFilterString", () => {
  it("builds a no-op filter string from default settings", () => {
    expect(buildFilterString(DEFAULT_FILTER_SETTINGS)).toBe(
      "grayscale(0%) sepia(0%) brightness(100%) contrast(100%) saturate(100%) invert(0%)",
    );
  });

  it("reflects custom settings in the output string", () => {
    const result = buildFilterString({ grayscale: 100, sepia: 0, brightness: 120, contrast: 90, saturate: 50, invert: 0 });
    expect(result).toContain("grayscale(100%)");
    expect(result).toContain("brightness(120%)");
    expect(result).toContain("contrast(90%)");
    expect(result).toContain("saturate(50%)");
  });
});
