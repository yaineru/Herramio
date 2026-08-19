export interface DateDiffResult {
  totalDays: number;
  weeks: number;
  remainderDays: number;
  years: number;
  months: number;
  days: number;
}

export type DateDiffCalcResult = { ok: true; value: DateDiffResult } | { ok: false; error: string };

/** Difference between two dates, both as a raw day count and a calendar-aware years/months/days breakdown. */
export function calculateDateDiff(start: Date, end: Date): DateDiffCalcResult {
  if (Number.isNaN(start.getTime())) return { ok: false, error: "La fecha de inicio no es válida." };
  if (Number.isNaN(end.getTime())) return { ok: false, error: "La fecha final no es válida." };

  const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start];

  const totalDays = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const weeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { ok: true, value: { totalDays, weeks, remainderDays, years, months, days } };
}
