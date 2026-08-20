export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string; // hex, e.g. #000000
  alpha: number; // 0-1
  inset: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Builds a box-shadow CSS value, stacking multiple layers separated by commas (later layers render on top, same as the CSS spec). */
export function buildBoxShadowCss(layers: ShadowLayer[]): string {
  return layers
    .map((l) => {
      const parts = [`${l.x}px`, `${l.y}px`, `${l.blur}px`, `${l.spread}px`, hexToRgba(l.color, l.alpha)];
      return l.inset ? `inset ${parts.join(" ")}` : parts.join(" ");
    })
    .join(", ");
}
