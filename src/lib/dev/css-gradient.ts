export interface GradientStop {
  color: string;
  position: number; // 0-100
}

/** Builds a linear-gradient() CSS value from stops (already sorted by the caller when order matters). */
export function buildLinearGradientCss(stops: GradientStop[], angleDeg: number): string {
  const stopList = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
  return `linear-gradient(${angleDeg}deg, ${stopList})`;
}
