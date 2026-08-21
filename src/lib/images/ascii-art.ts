// Ramp goes from densest (darkest) to sparsest (lightest) character.
const RAMP = "@%#*+=-:. ";

/**
 * Converts RGBA pixel data into monospace ASCII art. `cols` controls output
 * width in characters; rows are derived from the image's aspect ratio,
 * corrected by CHAR_ASPECT since monospace characters are taller than wide.
 */
const CHAR_ASPECT = 0.55;

export function imageDataToAscii(data: Uint8ClampedArray, width: number, height: number, cols: number): string {
  const clampedCols = Math.max(10, Math.min(300, Math.round(cols)));
  const rows = Math.max(1, Math.round(((height / width) * clampedCols) * CHAR_ASPECT));

  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < clampedCols; col++) {
      const srcX = Math.min(width - 1, Math.floor((col / clampedCols) * width));
      const srcY = Math.min(height - 1, Math.floor((row / rows) * height));
      const i = (srcY * width + srcX) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      // Perceptual luminance; transparent pixels render as blank space regardless of color.
      const luminance = alpha < 32 ? 255 : 0.299 * r + 0.587 * g + 0.114 * b;
      const charIndex = Math.min(RAMP.length - 1, Math.floor((luminance / 255) * RAMP.length));
      line += RAMP[charIndex];
    }
    lines.push(line);
  }
  return lines.join("\n");
}
