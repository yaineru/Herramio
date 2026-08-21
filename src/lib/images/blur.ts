import type { PixelRect } from "@/lib/images/pixelate";

/**
 * Returns a new RGBA buffer where every pixel inside `rect` is replaced by
 * the average of its surrounding radius×radius box — a simple, fast box
 * blur. Everything outside `rect` is untouched. Pure and unit-testable,
 * same shape as pixelateRegion so both tools share one interaction model.
 */
export function blurRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  rect: PixelRect,
  radius: number,
): Uint8ClampedArray {
  const out = Uint8ClampedArray.from(data);
  const r = Math.max(1, Math.floor(radius));

  const startX = Math.max(0, Math.floor(rect.x));
  const startY = Math.max(0, Math.floor(rect.y));
  const endX = Math.min(width, Math.ceil(rect.x + rect.width));
  const endY = Math.min(height, Math.ceil(rect.y + rect.height));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let sa = 0;
      let count = 0;

      for (let ky = -r; ky <= r; ky++) {
        const sy = y + ky;
        if (sy < 0 || sy >= height) continue;
        for (let kx = -r; kx <= r; kx++) {
          const sx = x + kx;
          if (sx < 0 || sx >= width) continue;
          const i = (sy * width + sx) * 4;
          sr += data[i];
          sg += data[i + 1];
          sb += data[i + 2];
          sa += data[i + 3];
          count++;
        }
      }

      const o = (y * width + x) * 4;
      out[o] = Math.round(sr / count);
      out[o + 1] = Math.round(sg / count);
      out[o + 2] = Math.round(sb / count);
      out[o + 3] = Math.round(sa / count);
    }
  }

  return out;
}
