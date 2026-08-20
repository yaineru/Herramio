export interface TimeZoneOption {
  id: string;
  label: string;
}

/** A curated set of major zones (not the full ~400-entry IANA list) — enough to cover real use without an unusable dropdown. */
export const TIME_ZONES: TimeZoneOption[] = [
  { id: "America/Los_Angeles", label: "Los Ángeles (PT)" },
  { id: "America/Denver", label: "Denver (MT)" },
  { id: "America/Chicago", label: "Chicago (CT)" },
  { id: "America/New_York", label: "Nueva York (ET)" },
  { id: "America/Mexico_City", label: "Ciudad de México" },
  { id: "America/Bogota", label: "Bogotá" },
  { id: "America/Lima", label: "Lima" },
  { id: "America/Santiago", label: "Santiago de Chile" },
  { id: "America/Caracas", label: "Caracas" },
  { id: "America/Sao_Paulo", label: "São Paulo" },
  { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { id: "UTC", label: "UTC" },
  { id: "Europe/London", label: "Londres" },
  { id: "Europe/Lisbon", label: "Lisboa" },
  { id: "Europe/Madrid", label: "Madrid" },
  { id: "Europe/Paris", label: "París" },
  { id: "Europe/Berlin", label: "Berlín" },
  { id: "Europe/Rome", label: "Roma" },
  { id: "Europe/Athens", label: "Atenas" },
  { id: "Europe/Moscow", label: "Moscú" },
  { id: "Africa/Cairo", label: "El Cairo" },
  { id: "Africa/Johannesburg", label: "Johannesburgo" },
  { id: "Asia/Dubai", label: "Dubái" },
  { id: "Asia/Karachi", label: "Karachi" },
  { id: "Asia/Kolkata", label: "Bombay / Nueva Delhi" },
  { id: "Asia/Dhaka", label: "Daca" },
  { id: "Asia/Bangkok", label: "Bangkok" },
  { id: "Asia/Shanghai", label: "Shanghái" },
  { id: "Asia/Tokyo", label: "Tokio" },
  { id: "Asia/Seoul", label: "Seúl" },
  { id: "Australia/Sydney", label: "Sídney" },
  { id: "Pacific/Auckland", label: "Auckland" },
];

/**
 * Interprets (year, month, day, hour, minute) as wall-clock time in
 * `zone` and returns the UTC instant it represents. There's no native API
 * for "parse this local time in an arbitrary IANA zone", so this uses the
 * standard workaround: format a UTC guess in the target zone, measure how
 * far off it is, and correct — which is DST-aware because Intl resolves
 * the offset for that specific instant, not a fixed UTC offset.
 */
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, zone: string): Date {
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date(guessUtc)).map((p) => [p.type, p.value]));
  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offset = asIfUtc - guessUtc;
  return new Date(guessUtc - offset);
}

export interface TimeZoneConversionResult {
  targetDate: string;
  targetTime: string;
  dayOffset: number;
}

/** Converts a wall-clock date/time in `fromZone` to the equivalent wall-clock date/time in `toZone`. */
export function convertTimeZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  fromZone: string,
  toZone: string,
): TimeZoneConversionResult | null {
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

  const utcInstant = zonedTimeToUtc(year, month, day, hour, minute, fromZone);
  if (Number.isNaN(utcInstant.getTime())) return null;

  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: toZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const timeFormatter = new Intl.DateTimeFormat("es", { timeZone: toZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  const targetDate = dateFormatter.format(utcInstant); // YYYY-MM-DD
  const targetTime = timeFormatter.format(utcInstant);

  const sourceDateOnly = Date.UTC(year, month - 1, day);
  const [ty, tm, td] = targetDate.split("-").map(Number);
  const targetDateOnly = Date.UTC(ty, tm - 1, td);
  const dayOffset = Math.round((targetDateOnly - sourceDateOnly) / 86_400_000);

  return { targetDate, targetTime, dayOffset };
}
