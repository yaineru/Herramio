/** Converts HH:MM into decimal hours (e.g. 8:30 -> 8.5), for payroll-style time sheets. */
export function hoursMinutesToDecimal(hours: number, minutes: number): number | null {
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || minutes < 0 || minutes >= 60) return null;
  return Math.round((hours + minutes / 60) * 100) / 100;
}

export interface HoursMinutes {
  hours: number;
  minutes: number;
}

/** Converts decimal hours back into whole hours + minutes (e.g. 8.5 -> 8h 30m). */
export function decimalToHoursMinutes(decimal: number): HoursMinutes | null {
  if (!Number.isFinite(decimal) || decimal < 0) return null;
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return minutes === 60 ? { hours: hours + 1, minutes: 0 } : { hours, minutes };
}

/** Sums a list of HH:MM time entries and returns the total in decimal hours. */
export function sumTimeEntries(entries: { hours: number; minutes: number }[]): number | null {
  if (entries.length === 0) return null;
  let totalMinutes = 0;
  for (const entry of entries) {
    const decimal = hoursMinutesToDecimal(entry.hours, entry.minutes);
    if (decimal === null) return null;
    totalMinutes += entry.hours * 60 + entry.minutes;
  }
  return Math.round((totalMinutes / 60) * 100) / 100;
}
