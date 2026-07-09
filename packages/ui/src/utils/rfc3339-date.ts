/**
 * Generic RFC 3339 primitives for date/time values whose offset must be preserved
 * verbatim end-to-end (the FE attaches the client offset; the backend stores the
 * string as-is; the device interprets it in its own gmt). These carry NO device /
 * PACS knowledge — the per-field encoding (which field shifts how, 1-A vs 1-B)
 * lives in the consuming project's UI layer, never here.
 *
 * Canonical wire format: `yyyy-MM-ddTHH:mm:ss±hh:mm` — seconds precision, NO
 * milliseconds, a fixed numeric offset (never `Z` for a local-day intent). Emitting
 * one consistent format for BOTH stored values and search-filter bounds keeps a
 * lexicographic string comparison equal to chronological order.
 */

/**
 * Serialize a `Date` to canonical RFC 3339 using its LOCAL wall-clock fields and
 * the runtime's LOCAL offset (dynamic — `+09:00` for a KST client, `+00:00` for a
 * UTC client, etc.; never hard-coded). A local-midnight `new Date(2026, 6, 8)` in a
 * KST runtime yields `2026-07-08T00:00:00+09:00`; the day never shifts (unlike
 * `date.toISOString()`, which converts to UTC and can roll the day).
 *
 * The input Date's time-of-day is preserved at seconds precision, so a caller that
 * has already applied a wall-clock shift (e.g. a device deactivation `-1 minute`)
 * gets `...T23:59:00±hh:mm`. Reads local getters only — the offset is derived from
 * {@link Date.getTimezoneOffset} (re-signed to east-positive).
 *
 * @returns the RFC 3339 string, or `undefined` for a null/undefined/invalid input.
 */
export function serializeRfc3339Local(date: Date | null | undefined): string | undefined {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return undefined;
  const pad = (n: number): string => String(n).padStart(2, "0");
  const offsetMinutes = -date.getTimezoneOffset(); // east-positive
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`
  );
}

/**
 * Parse an offset-aware RFC 3339 string (as produced by {@link serializeRfc3339Local})
 * into a `Date` via the native offset-aware parser. The absolute instant is exact; a
 * caller reads LOCAL getters to recover the wall-clock the writer intended (correct
 * under a single-zone deployment where the viewer offset equals the stored offset).
 *
 * @returns the `Date`, or `undefined` for a null/undefined/empty/invalid input.
 */
export function parseRfc3339(value: string | null | undefined): Date | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
