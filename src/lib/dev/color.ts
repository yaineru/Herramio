export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export type ColorParseResult = { ok: true; rgb: Rgb } | { ok: false; error: string };

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/i;
const HSL_RE = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*[\d.]+\s*)?\)$/i;

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** Accepts #hex, #rrggbb, rgb(r,g,b) or hsl(h,s%,l%) — whatever a user might paste. */
export function parseColor(input: string): ColorParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Ingresa un color." };

  const hexMatch = trimmed.match(HEX_RE);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { ok: true, rgb: { r, g, b } };
  }

  const rgbMatch = trimmed.match(RGB_RE);
  if (rgbMatch) {
    const [r, g, b] = rgbMatch.slice(1, 4).map(Number);
    if ([r, g, b].some((v) => v > 255)) return { ok: false, error: "Los valores RGB deben estar entre 0 y 255." };
    return { ok: true, rgb: { r: clampByte(r), g: clampByte(g), b: clampByte(b) } };
  }

  const hslMatch = trimmed.match(HSL_RE);
  if (hslMatch) {
    const [h, s, l] = hslMatch.slice(1, 4).map(Number);
    if (h > 360 || s > 100 || l > 100) return { ok: false, error: "H debe ser 0-360, S y L deben ser 0-100." };
    return { ok: true, rgb: hslToRgb({ h, s, l }) };
  }

  return { ok: false, error: "Formato no reconocido. Usa #hex, rgb(r,g,b) o hsl(h,s%,l%)." };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => clampByte(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn:
      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      break;
    case gn:
      h = ((bn - rn) / d + 2) / 6;
      break;
    default:
      h = ((rn - gn) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;

  if (sn === 0) {
    const v = clampByte(ln * 255);
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hueToRgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const hn = h / 360;
  return {
    r: clampByte(hueToRgb(hn + 1 / 3) * 255),
    g: clampByte(hueToRgb(hn) * 255),
    b: clampByte(hueToRgb(hn - 1 / 3) * 255),
  };
}

export function rgbString({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function hslString(hsl: Hsl): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
