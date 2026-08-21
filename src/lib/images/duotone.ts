export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Maps each pixel's luminance to a gradient between two chosen colors
 * (shadows → colorA, highlights → colorB) — the classic duotone/gradient-map
 * effect. Alpha is preserved untouched.
 */
export function applyDuotoneEffect(data: Uint8ClampedArray, colorA: RgbColor, colorB: RgbColor): Uint8ClampedArray {
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const luminance = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
    out[i] = colorA.r + (colorB.r - colorA.r) * luminance;
    out[i + 1] = colorA.g + (colorB.g - colorA.g) * luminance;
    out[i + 2] = colorA.b + (colorB.b - colorA.b) * luminance;
    out[i + 3] = data[i + 3];
  }
  return out;
}
