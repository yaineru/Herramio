/**
 * Deterministic RGB-channel-split + horizontal-slice-offset glitch effect.
 * No randomness: the same input + intensity always produces the same
 * output, which keeps this testable and keeps the live preview stable
 * while a slider is being dragged (no flicker from re-rolled noise).
 */
export function applyGlitchEffect(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
): Uint8ClampedArray {
  const shift = Math.max(1, Math.round((intensity / 100) * width * 0.04));
  const sliceHeight = Math.max(2, Math.round(height / 24));
  const out = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    const slice = Math.floor(y / sliceHeight);
    // Alternating, slice-dependent offsets — deterministic but visually varied.
    const sliceOffset = (slice % 5) - 2; // -2..2
    const rowShift = Math.round(shift * (sliceOffset / 2));

    for (let x = 0; x < width; x++) {
      const destIndex = (y * width + x) * 4;

      const rSrcX = clamp(x - rowShift, 0, width - 1);
      const bSrcX = clamp(x + rowShift, 0, width - 1);
      const rSrcIndex = (y * width + rSrcX) * 4;
      const bSrcIndex = (y * width + bSrcX) * 4;
      const gSrcIndex = destIndex;

      out[destIndex] = data[rSrcIndex]; // R from a shifted column
      out[destIndex + 1] = data[gSrcIndex + 1]; // G unshifted
      out[destIndex + 2] = data[bSrcIndex + 2]; // B from the opposite shift
      out[destIndex + 3] = data[destIndex + 3];
    }
  }

  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
