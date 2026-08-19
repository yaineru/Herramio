export type TimestampUnit = "seconds" | "milliseconds";

export interface TimestampToDateResult {
  ok: boolean;
  error?: string;
  iso?: string;
  local?: string;
  utc?: string;
  relative?: string;
}

export function timestampToDate(value: string, unit: TimestampUnit): TimestampToDateResult {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: "Ingresa un timestamp numérico válido." };
  }
  const num = Number(trimmed);
  const ms = unit === "seconds" ? num * 1000 : num;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "El timestamp está fuera de rango." };
  }
  return {
    ok: true,
    iso: date.toISOString(),
    local: date.toLocaleString("es"),
    utc: date.toUTCString(),
    relative: formatRelative(date),
  };
}

export interface DateToTimestampResult {
  ok: boolean;
  error?: string;
  seconds?: number;
  milliseconds?: number;
}

export function dateToTimestamp(isoOrDateTimeLocal: string): DateToTimestampResult {
  if (!isoOrDateTimeLocal.trim()) {
    return { ok: false, error: "Ingresa una fecha válida." };
  }
  const date = new Date(isoOrDateTimeLocal);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "No se pudo interpretar la fecha." };
  }
  return { ok: true, seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() };
}

function formatRelative(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2_592_000) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 31_536_000) return rtf.format(Math.round(diffSec / 2_592_000), "month");
  return rtf.format(Math.round(diffSec / 31_536_000), "year");
}

export function nowTimestamp(): { seconds: number; milliseconds: number } {
  const ms = Date.now();
  return { seconds: Math.floor(ms / 1000), milliseconds: ms };
}
