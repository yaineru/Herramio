export interface ImageFilterSettings {
  grayscale: number; // 0-100
  sepia: number; // 0-100
  brightness: number; // 0-200, 100 = unchanged
  contrast: number; // 0-200, 100 = unchanged
  saturate: number; // 0-200, 100 = unchanged
  invert: number; // 0-100
}

export const DEFAULT_FILTER_SETTINGS: ImageFilterSettings = {
  grayscale: 0,
  sepia: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  invert: 0,
};

/** Builds a CSS/Canvas `filter` value string from filter settings, ready for `ctx.filter`. */
export function buildFilterString(settings: ImageFilterSettings): string {
  const parts = [
    `grayscale(${settings.grayscale}%)`,
    `sepia(${settings.sepia}%)`,
    `brightness(${settings.brightness}%)`,
    `contrast(${settings.contrast}%)`,
    `saturate(${settings.saturate}%)`,
    `invert(${settings.invert}%)`,
  ];
  return parts.join(" ");
}

export interface FilterPreset {
  id: string;
  label: string;
  settings: Partial<ImageFilterSettings>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "none", label: "Original", settings: {} },
  { id: "bw", label: "Blanco y negro", settings: { grayscale: 100 } },
  { id: "sepia", label: "Sepia", settings: { sepia: 80 } },
  { id: "vivid", label: "Vívido", settings: { saturate: 160, contrast: 110 } },
  { id: "fade", label: "Desaturado", settings: { saturate: 40, brightness: 105 } },
  { id: "invert", label: "Invertido", settings: { invert: 100 } },
];
