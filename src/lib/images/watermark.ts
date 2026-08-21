export interface TilePosition {
  x: number;
  y: number;
}

/** Computes a regular grid of tile positions covering a canvas, used to repeat a watermark across the whole image. */
export function computeWatermarkTilePositions(canvasWidth: number, canvasHeight: number, spacing: number): TilePosition[] {
  const step = Math.max(1, spacing);
  const positions: TilePosition[] = [];
  for (let y = step / 2; y < canvasHeight + step; y += step) {
    for (let x = step / 2; x < canvasWidth + step; x += step) {
      positions.push({ x, y });
    }
  }
  return positions;
}
