export interface SocialCropPreset {
  id: string;
  label: string;
  ratio: number; // width / height
  outputWidth: number;
}

export const SOCIAL_CROP_PRESETS: SocialCropPreset[] = [
  { id: "ig-square", label: "Instagram · Publicación cuadrada (1:1)", ratio: 1, outputWidth: 1080 },
  { id: "ig-portrait", label: "Instagram · Publicación vertical (4:5)", ratio: 4 / 5, outputWidth: 1080 },
  { id: "ig-story", label: "Instagram/TikTok · Historia o Reel (9:16)", ratio: 9 / 16, outputWidth: 1080 },
  { id: "yt-thumb", label: "YouTube · Miniatura (16:9)", ratio: 16 / 9, outputWidth: 1280 },
  { id: "li-cover", label: "LinkedIn · Portada de perfil (4:1)", ratio: 4, outputWidth: 1584 },
  { id: "fb-cover", label: "Facebook · Portada (205:78)", ratio: 205 / 78, outputWidth: 820 },
  { id: "wa-status", label: "WhatsApp · Estado (9:16)", ratio: 9 / 16, outputWidth: 1080 },
];

export interface CoverCropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Computes the centered source rectangle to crop from an image so it exactly fills the given target ratio (cover, not contain). */
export function computeCoverCropRect(imageWidth: number, imageHeight: number, targetRatio: number): CoverCropRect {
  const imageRatio = imageWidth / imageHeight;

  if (imageRatio > targetRatio) {
    const sw = imageHeight * targetRatio;
    return { sx: (imageWidth - sw) / 2, sy: 0, sw, sh: imageHeight };
  }

  const sh = imageWidth / targetRatio;
  return { sx: 0, sy: (imageHeight - sh) / 2, sw: imageWidth, sh };
}
