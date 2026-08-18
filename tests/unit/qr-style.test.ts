import { describe, it, expect } from "vitest";
import { getContrastRatio, evaluateQrContrast } from "@/lib/qr/style";

describe("getContrastRatio", () => {
  it("returns the maximum ratio for black on white", () => {
    expect(getContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("returns 1 for identical colors", () => {
    expect(getContrastRatio("#059669", "#059669")).toBeCloseTo(1, 5);
  });
});

describe("evaluateQrContrast", () => {
  it("flags very low contrast as danger", () => {
    const result = evaluateQrContrast("#ffffff", "#fefefe");
    expect(result.level).toBe("danger");
    expect(result.message).not.toBeNull();
  });

  it("marks black on white as ok", () => {
    const result = evaluateQrContrast("#000000", "#ffffff");
    expect(result.level).toBe("ok");
    expect(result.message).toBeNull();
  });
});
