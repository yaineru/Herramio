export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Returns a new RGBA buffer where every blockSize×blockSize block inside
 * `rect` is replaced by its average color — the rest of the image is
 * untouched. Operates on raw pixel data (not the DOM ImageData class) so it
 * stays a pure, unit-testable function; the canvas-facing caller wraps the
 * result back into ImageData.
 */
export function pixelateRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  rect: PixelRect,
  blockSize: number,
): Uint8ClampedArray {
  const out = Uint8ClampedArray.from(data);
  const size = Math.max(1, Math.floor(blockSize));

  const startX = Math.max(0, Math.floor(rect.x));
  const startY = Math.max(0, Math.floor(rect.y));
  const endX = Math.min(width, Math.ceil(rect.x + rect.width));
  const endY = Math.min(height, Math.ceil(rect.y + rect.height));

  for (let by = startY; by < endY; by += size) {
    for (let bx = startX; bx < endX; bx += size) {
      const blockEndX = Math.min(bx + size, endX);
      const blockEndY = Math.min(by + size, endY);

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;
      for (let y = by; y < blockEndY; y++) {
        for (let x = bx; x < blockEndX; x++) {
          const i = (y * width + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
          count++;
        }
      }
      if (count === 0) continue;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      for (let y = by; y < blockEndY; y++) {
        for (let x = bx; x < blockEndX; x++) {
          const i = (y * width + x) * 4;
          out[i] = r;
          out[i + 1] = g;
          out[i + 2] = b;
          out[i + 3] = a;
        }
      }
    }
  }

  return out;
}
