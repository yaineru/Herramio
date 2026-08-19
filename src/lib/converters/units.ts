export type UnitCategoryId = "longitud" | "peso" | "temperatura" | "area" | "volumen" | "tiempo";

export interface UnitDef {
  id: string;
  label: string;
}

export interface UnitCategoryDef {
  id: UnitCategoryId;
  label: string;
  units: UnitDef[];
}

// Linear categories convert via a factor to a base unit (meters, kilograms,
// square meters, liters, seconds). Temperature is handled separately below
// since Celsius/Fahrenheit/Kelvin aren't related by a simple multiplier.
const LINEAR_FACTORS: Record<Exclude<UnitCategoryId, "temperatura">, Record<string, number>> = {
  longitud: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  },
  peso: {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    t: 1000,
    oz: 0.0283495,
    lb: 0.45359237,
  },
  area: {
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,
    ha: 10000,
    ft2: 0.09290304,
    ac: 4046.8564224,
  },
  volumen: {
    ml: 0.001,
    l: 1,
    m3: 1000,
    gal: 3.785411784,
    qt: 0.946352946,
    fl_oz: 0.0295735296,
  },
  tiempo: {
    s: 1,
    min: 60,
    h: 3600,
    day: 86400,
    week: 604800,
  },
};

export const UNIT_CATEGORIES: UnitCategoryDef[] = [
  {
    id: "longitud",
    label: "Longitud",
    units: [
      { id: "mm", label: "Milímetros (mm)" },
      { id: "cm", label: "Centímetros (cm)" },
      { id: "m", label: "Metros (m)" },
      { id: "km", label: "Kilómetros (km)" },
      { id: "in", label: "Pulgadas (in)" },
      { id: "ft", label: "Pies (ft)" },
      { id: "yd", label: "Yardas (yd)" },
      { id: "mi", label: "Millas (mi)" },
    ],
  },
  {
    id: "peso",
    label: "Peso",
    units: [
      { id: "mg", label: "Miligramos (mg)" },
      { id: "g", label: "Gramos (g)" },
      { id: "kg", label: "Kilogramos (kg)" },
      { id: "t", label: "Toneladas (t)" },
      { id: "oz", label: "Onzas (oz)" },
      { id: "lb", label: "Libras (lb)" },
    ],
  },
  {
    id: "temperatura",
    label: "Temperatura",
    units: [
      { id: "c", label: "Celsius (°C)" },
      { id: "f", label: "Fahrenheit (°F)" },
      { id: "k", label: "Kelvin (K)" },
    ],
  },
  {
    id: "area",
    label: "Área",
    units: [
      { id: "cm2", label: "Centímetros² (cm²)" },
      { id: "m2", label: "Metros² (m²)" },
      { id: "km2", label: "Kilómetros² (km²)" },
      { id: "ha", label: "Hectáreas (ha)" },
      { id: "ft2", label: "Pies² (ft²)" },
      { id: "ac", label: "Acres" },
    ],
  },
  {
    id: "volumen",
    label: "Volumen",
    units: [
      { id: "ml", label: "Mililitros (ml)" },
      { id: "l", label: "Litros (l)" },
      { id: "m3", label: "Metros³ (m³)" },
      { id: "gal", label: "Galones US (gal)" },
      { id: "qt", label: "Cuartos US (qt)" },
      { id: "fl_oz", label: "Onzas líquidas US (fl oz)" },
    ],
  },
  {
    id: "tiempo",
    label: "Tiempo",
    units: [
      { id: "s", label: "Segundos (s)" },
      { id: "min", label: "Minutos (min)" },
      { id: "h", label: "Horas (h)" },
      { id: "day", label: "Días" },
      { id: "week", label: "Semanas" },
    ],
  },
];

function convertTemperature(from: string, to: string, value: number): number | null {
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = ((value - 32) * 5) / 9;
  else if (from === "k") celsius = value - 273.15;
  else return null;

  if (to === "c") return celsius;
  if (to === "f") return (celsius * 9) / 5 + 32;
  if (to === "k") return celsius + 273.15;
  return null;
}

/** Converts `value` from unit `from` to unit `to` within `category`. Returns null for unknown units or non-finite input. */
export function convertUnits(
  category: UnitCategoryId,
  from: string,
  to: string,
  value: number,
): number | null {
  if (!Number.isFinite(value)) return null;

  if (category === "temperatura") {
    return convertTemperature(from, to, value);
  }

  const factors = LINEAR_FACTORS[category];
  const fromFactor = factors[from];
  const toFactor = factors[to];
  if (fromFactor === undefined || toFactor === undefined) return null;

  const baseValue = value * fromFactor;
  return baseValue / toFactor;
}
