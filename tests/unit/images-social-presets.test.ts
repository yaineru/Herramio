import { describe, it, expect } from "vitest";
import { computeCoverCropRect, SOCIAL_CROP_PRESETS } from "@/lib/images/social-presets";

describe("computeCoverCropRect", () => {
  it("crops the sides for a wide image targeting a square ratio", () => {
    const rect = computeCoverCropRect(1600, 800, 1);
    expect(rect.sh).toBe(800);
    expect(rect.sw).toBe(800);
    expect(rect.sx).toBe(400);
    expect(rect.sy).toBe(0);
  });

  it("crops the top/bottom for a tall image targeting a square ratio", () => {
    const rect = computeCoverCropRect(800, 1600, 1);
    expect(rect.sw).toBe(800);
    expect(rect.sh).toBe(800);
    expect(rect.sy).toBe(400);
    expect(rect.sx).toBe(0);
  });

  it("returns the full image when the ratio already matches", () => {
    const rect = computeCoverCropRect(1920, 1080, 16 / 9);
    expect(rect.sw).toBeCloseTo(1920);
    expect(rect.sh).toBeCloseTo(1080);
    expect(rect.sx).toBeCloseTo(0);
    expect(rect.sy).toBeCloseTo(0);
  });

  it("computes a valid crop for a vertical 9:16 target from a square source", () => {
    const rect = computeCoverCropRect(1000, 1000, 9 / 16);
    expect(rect.sw).toBeCloseTo(562.5);
    expect(rect.sh).toBe(1000);
  });
});

describe("SOCIAL_CROP_PRESETS", () => {
  it("has unique ids", () => {
    const ids = SOCIAL_CROP_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a positive ratio and output width for every preset", () => {
    for (const preset of SOCIAL_CROP_PRESETS) {
      expect(preset.ratio).toBeGreaterThan(0);
      expect(preset.outputWidth).toBeGreaterThan(0);
    }
  });
});
