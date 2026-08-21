export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalMs: number;
}

/** Breaks down the time remaining (or elapsed, if in the past) between `now` and `target` into days/hours/minutes/seconds. */
export function computeCountdown(target: Date, now: Date): CountdownResult {
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast, totalMs: diffMs };
}
