import { describe, it, expect } from "vitest";
import { binarySearchQuality } from "@/lib/images/target-size";

describe("binarySearchQuality", () => {
  it("converges close to the quality whose size matches the target, for a monotonic size function", async () => {
    const measureSize = async (quality: number) => quality * 1000;
    const quality = await binarySearchQuality(measureSize, 500, 12);
    expect(quality).toBeGreaterThan(0.48);
    expect(quality).toBeLessThanOrEqual(0.5);
  });

  it("never returns a quality whose measured size exceeds the target", async () => {
    const measureSize = async (quality: number) => quality * 2000;
    const quality = await binarySearchQuality(measureSize, 300, 12);
    expect(await measureSize(quality)).toBeLessThanOrEqual(300);
  });

  it("returns the lowest quality when even minimal quality exceeds the target", async () => {
    const measureSize = async () => 999999;
    const quality = await binarySearchQuality(measureSize, 100, 8);
    expect(quality).toBe(0.01);
  });

  it("returns close to max quality when the target is very generous", async () => {
    const measureSize = async (quality: number) => quality * 10;
    const quality = await binarySearchQuality(measureSize, 1000, 8);
    expect(quality).toBeGreaterThan(0.95);
  });
});
