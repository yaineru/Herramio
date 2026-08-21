export type DataUnit = "b" | "kb" | "mb" | "gb" | "tb";

export const DATA_UNITS: DataUnit[] = ["b", "kb", "mb", "gb", "tb"];

const EXPONENTS: Record<DataUnit, number> = { b: 0, kb: 1, mb: 2, gb: 3, tb: 4 };

export type DataSizeResult = Record<DataUnit, number>;

/** Converts a byte-size value between B/KB/MB/GB/TB, using either the binary (1024) or decimal (1000) base. */
export function convertDataSize(value: number, fromUnit: DataUnit, base: 1024 | 1000): DataSizeResult | null {
  if (!Number.isFinite(value) || value < 0) return null;

  const bytes = value * base ** EXPONENTS[fromUnit];
  const result = {} as DataSizeResult;
  for (const unit of DATA_UNITS) {
    result[unit] = bytes / base ** EXPONENTS[unit];
  }
  return result;
}
