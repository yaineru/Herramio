export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRStyleOptions {
  size: number;
  margin: number;
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  errorCorrectionLevel: ErrorCorrectionLevel;
  dotStyle: DotStyle;
  logoDataUrl?: string | null;
}

export const DEFAULT_QR_STYLE: QRStyleOptions = {
  size: 320,
  margin: 8,
  fgColor: "#111827",
  bgColor: "#ffffff",
  transparentBg: false,
  errorCorrectionLevel: "Q",
  dotStyle: "square",
  logoDataUrl: null,
};

export const DOT_STYLE_OPTIONS: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Cuadrado" },
  { value: "dots", label: "Puntos" },
  { value: "rounded", label: "Redondeado" },
  { value: "classy", label: "Clásico" },
  { value: "classy-rounded", label: "Clásico redondeado" },
  { value: "extra-rounded", label: "Extra redondeado" },
];

export const ERROR_CORRECTION_OPTIONS: { value: ErrorCorrectionLevel; label: string }[] = [
  { value: "L", label: "Baja (L) — QR más simple" },
  { value: "M", label: "Media (M)" },
  { value: "Q", label: "Alta (Q) — recomendado" },
  { value: "H", label: "Máxima (H) — ideal con logo" },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [channel(r), channel(g), channel(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function getContrastRatio(hexA: string, hexB: string): number {
  try {
    const lumA = relativeLuminance(hexToRgb(hexA));
    const lumB = relativeLuminance(hexToRgb(hexB));
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 21;
  }
}

export function evaluateQrContrast(fg: string, bg: string): {
  ratio: number;
  level: "ok" | "warning" | "danger";
  message: string | null;
} {
  const ratio = getContrastRatio(fg, bg);
  if (ratio < 2.5) {
    return {
      ratio,
      level: "danger",
      message:
        "El contraste entre el color y el fondo es muy bajo. Es probable que este QR no se pueda escanear.",
    };
  }
  if (ratio < 4) {
    return {
      ratio,
      level: "warning",
      message:
        "El contraste es bajo. Algunos lectores de cámara podrían tener problemas para escanear este QR.",
    };
  }
  return { ratio, level: "ok", message: null };
}
