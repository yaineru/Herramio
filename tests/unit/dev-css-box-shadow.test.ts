import { describe, it, expect } from "vitest";
import { buildBoxShadowCss } from "@/lib/dev/css-box-shadow";

describe("buildBoxShadowCss", () => {
  it("builds a single outer shadow", () => {
    const result = buildBoxShadowCss([{ x: 4, y: 4, blur: 10, spread: 0, color: "#000000", alpha: 0.5, inset: false }]);
    expect(result).toBe("4px 4px 10px 0px rgba(0, 0, 0, 0.5)");
  });

  it("prefixes inset shadows", () => {
    const result = buildBoxShadowCss([{ x: 0, y: 0, blur: 5, spread: 2, color: "#FFFFFF", alpha: 1, inset: true }]);
    expect(result).toBe("inset 0px 0px 5px 2px rgba(255, 255, 255, 1)");
  });

  it("stacks multiple layers separated by commas", () => {
    const result = buildBoxShadowCss([
      { x: 1, y: 1, blur: 2, spread: 0, color: "#111111", alpha: 0.3, inset: false },
      { x: -1, y: -1, blur: 2, spread: 0, color: "#EEEEEE", alpha: 0.8, inset: false },
    ]);
    expect(result).toBe("1px 1px 2px 0px rgba(17, 17, 17, 0.3), -1px -1px 2px 0px rgba(238, 238, 238, 0.8)");
  });

  it("returns an empty string for no layers", () => {
    expect(buildBoxShadowCss([])).toBe("");
  });
});
