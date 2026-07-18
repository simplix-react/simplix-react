/** Minutes-since-midnight for a `"HH:mm"` string. */
export function parseHmToMinutes(hm: string): number {
  const [h, m] = hm.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

/**
 * Minutes-since-midnight for a Date, read from its LOCAL fields (wall clock).
 *
 * The axis position therefore follows the wall clock the `Date` carries: pass
 * absolute instants through a display-zone projection (a floating carrier, e.g.
 * `decodeInstant(iso, zone)` from `@simplix-react/ui`) before they reach the
 * calendar so bars sit at the display zone's clock, not the browser's.
 */
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
