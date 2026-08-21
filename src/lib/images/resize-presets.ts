export interface ResizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { id: "instagram-square", label: "Instagram · Publicación cuadrada", width: 1080, height: 1080 },
  { id: "instagram-portrait", label: "Instagram · Publicación vertical", width: 1080, height: 1350 },
  { id: "instagram-story", label: "Instagram / TikTok · Historia o Reel", width: 1080, height: 1920 },
  { id: "youtube-thumbnail", label: "YouTube · Miniatura", width: 1280, height: 720 },
  { id: "facebook-post", label: "Facebook · Publicación", width: 1200, height: 630 },
  { id: "twitter-post", label: "X (Twitter) · Publicación", width: 1600, height: 900 },
  { id: "linkedin-post", label: "LinkedIn · Publicación", width: 1200, height: 627 },
  { id: "profile-picture", label: "Foto de perfil (WhatsApp, etc.)", width: 500, height: 500 },
];

/** Given a new value for one dimension, returns the paired dimension that preserves the original aspect ratio. */
export function maintainAspectRatio(
  originalWidth: number,
  originalHeight: number,
  changed: "width" | "height",
  newValue: number,
): number {
  if (originalWidth <= 0 || originalHeight <= 0 || newValue <= 0) return newValue;
  const ratio = originalWidth / originalHeight;
  return changed === "width" ? Math.max(1, Math.round(newValue / ratio)) : Math.max(1, Math.round(newValue * ratio));
}
