import { describe, it, expect } from "vitest";
import { computeWatermarkTilePositions } from "@/lib/images/watermark";

describe("computeWatermarkTilePositions", () => {
  it("covers the full canvas with a regular grid", () => {
    const positions = computeWatermarkTilePositions(200, 100, 100);
    expect(positions.length).toBeGreaterThan(0);
    expect(Math.max(...positions.map((p) => p.x))).toBeGreaterThanOrEqual(150);
    expect(Math.max(...positions.map((p) => p.y))).toBeGreaterThanOrEqual(50);
  });

  it("produces more tiles for smaller spacing", () => {
    const sparse = computeWatermarkTilePositions(400, 400, 200);
    const dense = computeWatermarkTilePositions(400, 400, 50);
    expect(dense.length).toBeGreaterThan(sparse.length);
  });

  it("clamps spacing to a minimum of 1 to avoid an infinite loop", () => {
    const positions = computeWatermarkTilePositions(10, 10, 0);
    expect(positions.length).toBeGreaterThan(0);
    expect(positions.length).toBeLessThan(1000);
  });
});
