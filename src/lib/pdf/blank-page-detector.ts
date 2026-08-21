/**
 * Treats a rendered page as "blank" when every pixel is at or above the
 * brightness threshold on all three color channels — i.e. it's uniformly
 * near-white with no ink. Runs on a low-scale render so a full page check
 * stays fast; a false negative just means a mostly-blank page gets kept.
 */
export function isImageDataBlank(data: Uint8ClampedArray, threshold = 250): boolean {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < threshold || data[i + 1] < threshold || data[i + 2] < threshold) return false;
  }
  return true;
}
