export interface CronFields {
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

export type CronParseResult = { ok: true; value: CronFields } | { ok: false; error: string };

const FIELD_RANGES = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6],
} as const;

function parseCronField(field: string, min: number, max: number): number[] | null {
  const result = new Set<number>();
  const parts = field.split(",").filter(Boolean);
  if (parts.length === 0) return null;

  for (const part of parts) {
    const match = part.match(/^(\*|\d+-\d+|\d+)(\/(\d+))?$/);
    if (!match) return null;

    const base = match[1];
    const step = match[3] ? Number(match[3]) : 1;
    if (step <= 0) return null;

    let start: number;
    let end: number;
    if (base === "*") {
      start = min;
      end = max;
    } else if (base.includes("-")) {
      const [s, e] = base.split("-").map(Number);
      if (s > e || s < min || e > max) return null;
      start = s;
      end = e;
    } else {
      const n = Number(base);
      if (n < min || n > max) return null;
      start = n;
      end = match[3] ? max : n;
    }

    for (let v = start; v <= end; v += step) result.add(v);
  }

  return result.size > 0 ? Array.from(result).sort((a, b) => a - b) : null;
}

/** Parses a standard 5-field cron expression (minute hour day-of-month month day-of-week). */
export function parseCronExpression(expression: string): CronParseResult {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { ok: false, error: "Una expresión cron tiene exactamente 5 campos: minuto hora día-del-mes mes día-de-la-semana." };
  }

  const [minuteStr, hourStr, domStr, monthStr, dowStr] = parts;
  const minute = parseCronField(minuteStr, ...FIELD_RANGES.minute);
  const hour = parseCronField(hourStr, ...FIELD_RANGES.hour);
  const dayOfMonth = parseCronField(domStr, ...FIELD_RANGES.dayOfMonth);
  const month = parseCronField(monthStr, ...FIELD_RANGES.month);
  const dayOfWeek = parseCronField(dowStr, ...FIELD_RANGES.dayOfWeek);

  if (!minute || !hour || !dayOfMonth || !month || !dayOfWeek) {
    return { ok: false, error: "Uno de los campos no es válido. Usa números, rangos (1-5), listas (1,2,3), * o pasos (*/5)." };
  }

  return { ok: true, value: { minute, hour, dayOfMonth, month, dayOfWeek } };
}

function isAll(values: number[], min: number, max: number): boolean {
  return values.length === max - min + 1;
}

function everyStepOf(values: number[], min: number, max: number): number | null {
  if (values.length < 2 || values[0] !== min) return null;
  const step = values[1] - values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== step) return null;
  }
  return values[values.length - 1] + step > max ? step : null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Best-effort Spanish description of what a cron expression means — covers the vast majority of real-world schedules, not every possible combination. */
export function describeCron(fields: CronFields): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;
  const minuteAll = isAll(minute, 0, 59);
  const hourAll = isAll(hour, 0, 23);
  const domAll = isAll(dayOfMonth, 1, 31);
  const monthAll = isAll(month, 1, 12);
  const dowAll = isAll(dayOfWeek, 0, 6);

  let timePart: string;
  const minuteStep = everyStepOf(minute, 0, 59);
  if (minuteAll && hourAll) {
    timePart = "cada minuto";
  } else if (minuteStep && hourAll) {
    timePart = `cada ${minuteStep} minutos`;
  } else if (minute.length === 1 && hourAll) {
    timePart = `en el minuto ${minute[0]} de cada hora`;
  } else if (minute.length === 1 && hour.length === 1) {
    timePart = `a las ${pad(hour[0])}:${pad(minute[0])}`;
  } else {
    timePart = `en los minutos ${minute.join(", ")} de las horas ${hour.join(", ")}`;
  }

  let dayPart = "";
  if (domAll && dowAll) {
    dayPart = "todos los días";
  } else if (domAll && !dowAll) {
    dayPart = `los ${dayOfWeek.map((d) => WEEKDAY_NAMES[d]).join(", ")}`;
  } else if (!domAll && dowAll) {
    dayPart = `los días ${dayOfMonth.join(", ")} de cada mes`;
  } else {
    dayPart = `los días ${dayOfMonth.join(", ")} de cada mes o los ${dayOfWeek.map((d) => WEEKDAY_NAMES[d]).join(", ")}`;
  }

  const monthPart = monthAll ? "" : ` en ${month.map((m) => MONTH_NAMES[m - 1]).join(", ")}`;

  return `Se ejecuta ${timePart}, ${dayPart}${monthPart}.`;
}

function dayMatches(fields: CronFields, date: Date): boolean {
  const domAll = isAll(fields.dayOfMonth, 1, 31);
  const dowAll = isAll(fields.dayOfWeek, 0, 6);
  if (domAll && dowAll) return true;
  const domMatch = fields.dayOfMonth.includes(date.getDate());
  const dowMatch = fields.dayOfWeek.includes(date.getDay());
  if (domAll) return dowMatch;
  if (dowAll) return domMatch;
  return domMatch || dowMatch;
}

/** Brute-force scans forward minute by minute (capped at ~2 years) to find the next `count` times this schedule fires, in local time. */
export function nextRunTimes(fields: CronFields, from: Date, count: number): Date[] {
  const minuteSet = new Set(fields.minute);
  const hourSet = new Set(fields.hour);
  const monthSet = new Set(fields.month);

  const results: Date[] = [];
  const cursor = new Date(from.getTime());
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 60 * 24 * 366 * 2;
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    if (
      minuteSet.has(cursor.getMinutes()) &&
      hourSet.has(cursor.getHours()) &&
      monthSet.has(cursor.getMonth() + 1) &&
      dayMatches(fields, cursor)
    ) {
      results.push(new Date(cursor.getTime()));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}
