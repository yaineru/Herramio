import { rgbToHex } from "@/lib/dev/color";

export interface PaletteColor {
  hex: string;
  percentage: number;
}

const BUCKET_SIZE = 24; // quantization step per channel — groups near-identical shades together

function quantize(channel: number): number {
  return Math.min(255, Math.round(channel / BUCKET_SIZE) * BUCKET_SIZE);
}

/**
 * Counts quantized colors across an RGBA buffer and returns the `count` most
 * frequent ones. Quantizing (rounding each channel to the nearest bucket)
 * before counting is what turns "thousands of near-identical shades of sky
 * blue" into one representative swatch instead of noise.
 */
export function extractPalette(data: Uint8ClampedArray, count: number): PaletteColor[] {
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  let totalCounted = 0;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue; // skip mostly-transparent pixels

    const r = quantize(data[i]);
    const g = quantize(data[i + 1]);
    const b = quantize(data[i + 2]);
    const key = `${r},${g},${b}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
    totalCounted++;
  }

  if (totalCounted === 0) return [];

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((bucket) => ({
      hex: rgbToHex({ r: bucket.r, g: bucket.g, b: bucket.b }),
      percentage: Math.round((bucket.count / totalCounted) * 1000) / 10,
    }));
}
