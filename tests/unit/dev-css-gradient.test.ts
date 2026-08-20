import { describe, it, expect } from "vitest";
import { buildLinearGradientCss } from "@/lib/dev/css-gradient";

describe("buildLinearGradientCss", () => {
  it("builds a two-stop gradient", () => {
    const result = buildLinearGradientCss(
      [
        { color: "#10B981", position: 0 },
        { color: "#3B82F6", position: 100 },
      ],
      90,
    );
    expect(result).toBe("linear-gradient(90deg, #10B981 0%, #3B82F6 100%)");
  });

  it("supports more than two stops", () => {
    const result = buildLinearGradientCss(
      [
        { color: "red", position: 0 },
        { color: "yellow", position: 50 },
        { color: "blue", position: 100 },
      ],
      45,
    );
    expect(result).toBe("linear-gradient(45deg, red 0%, yellow 50%, blue 100%)");
  });
});
