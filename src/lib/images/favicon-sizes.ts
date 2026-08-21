export interface FaviconSize {
  id: string;
  label: string;
  size: number;
}

export const FAVICON_SIZES: FaviconSize[] = [
  { id: "favicon-16", label: "favicon-16x16.png", size: 16 },
  { id: "favicon-32", label: "favicon-32x32.png", size: 32 },
  { id: "favicon-48", label: "favicon-48x48.png", size: 48 },
  { id: "apple-touch-icon", label: "apple-touch-icon.png (180×180)", size: 180 },
  { id: "android-192", label: "android-chrome-192x192.png", size: 192 },
  { id: "android-512", label: "android-chrome-512x512.png", size: 512 },
];
