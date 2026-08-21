import type { PixelRect } from "@/lib/images/pixelate";

export interface CropAspectPreset {
  id: string;
  label: string;
  ratio: number | null; // null = free aspect ratio
}

export const CROP_PRESETS: CropAspectPreset[] = [
  { id: "free", label: "Libre", ratio: null },
  { id: "square", label: "Cuadrado (1:1)", ratio: 1 },
  { id: "portrait-4-5", label: "Instagram vertical (4:5)", ratio: 4 / 5 },
  { id: "story-9-16", label: "Historia / Reel (9:16)", ratio: 9 / 16 },
  { id: "landscape-16-9", label: "Video (16:9)", ratio: 16 / 9 },
];

/** Recomputes rect.height from rect.width so width/height matches the given ratio, keeping x/y/width unchanged. */
export function constrainToAspect(rect: PixelRect, ratio: number): PixelRect {
  return { ...rect, height: rect.width / ratio };
}
