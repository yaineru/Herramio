export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Makes every pixel within `tolerance` of `targetColor` fully transparent —
 * a simple chroma-key background remover. Works well for solid or
 * near-solid backgrounds (product photos on white, green-screen shots);
 * it has no concept of subjects or edges, so it won't cleanly separate a
 * complex or textured background.
 */
export function removeColorBackground(data: Uint8ClampedArray, targetColor: RgbColor, tolerance: number): Uint8ClampedArray {
  const out = Uint8ClampedArray.from(data);
  const maxDistance = tolerance * tolerance * 3; // squared-distance threshold across 3 channels

  for (let i = 0; i < out.length; i += 4) {
    const dr = out[i] - targetColor.r;
    const dg = out[i + 1] - targetColor.g;
    const db = out[i + 2] - targetColor.b;
    const distance = dr * dr + dg * dg + db * db;
    if (distance <= maxDistance) out[i + 3] = 0;
  }

  return out;
}
