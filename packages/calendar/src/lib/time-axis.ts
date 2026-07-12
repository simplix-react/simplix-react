/** Minutes-since-midnight for a `"HH:mm"` string. */
export function parseHmToMinutes(hm: string): number {
  const [h, m] = hm.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

/** Minutes-since-midnight for a Date. */
export function dateToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Percent offset of a minute value within the visible `[firstHour, lastHour]` window. */
export function minutesToPercent(minutes: number, firstHour: number, lastHour: number): number {
  const start = firstHour * 60;
  const end = lastHour * 60;
  const range = end - start || 1;
  const clamped = Math.min(Math.max(minutes, start), end);
  return ((clamped - start) / range) * 100;
}
