/**
 * Semantic-kind date/time string primitives. Every date/time value is encoded
 * by its meaning, not by a single one-size serializer:
 *
 * - Absolute instant → offset-bearing RFC 3339 `yyyy-MM-ddTHH:mm:ss±HH:MM`.
 *   The offset is either an explicit IANA display zone's offset at that wall
 *   clock (site-scoped pickers) or the browser offset (legacy path).
 * - Calendar date → bare `yyyy-MM-dd` (zone-neutral).
 * - Wall-clock time → `HH:mm[:ss]` (zone-neutral).
 *
 * Decoding restores a value from the string's OWN components (textual for
 * calendar date / wall-clock time; parse-then-reproject for instants), never
 * via a viewer's local `Date` getters. Zone math uses the `Intl` API only —
 * this module carries NO date library and must not gain one.
 *
 * Canonical instant wire format: `yyyy-MM-ddTHH:mm:ss±HH:MM` — seconds
 * precision, NO milliseconds, a fixed numeric offset (never `Z` for a
 * local-day intent). One consistent format for BOTH stored values and
 * search-filter bounds keeps a lexicographic string comparison equal to
 * chronological order.
 */

import { asPlainDate } from "./parse-date";
import { toLocalDateString } from "./format-date";
import type { TimeValue } from "./time-select";

// ── IANA zone-offset helpers (module-private, Intl-only) ──

/** East-positive offset (minutes) of `timeZone` at the given absolute instant, via Intl. */
function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(instant)) if (p.type !== "literal") map[p.type] = Number(p.value);
  const asUTC = Date.UTC(map.year, map.month - 1, map.day, map.hour, map.minute, map.second);
  return Math.round((asUTC - instant.getTime()) / 60_000);
}

/** The wall-clock fields (y, mo 1-based, d, h, mi, s) interpreted IN `timeZone` → { instant, offsetMin }. */
function zonedFieldsToInstant(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  timeZone: string,
): { instant: Date; offsetMin: number } {
  const guessUTC = Date.UTC(y, mo - 1, d, h, mi, s);
  const o1 = zoneOffsetMinutes(new Date(guessUTC), timeZone);
  const o2 = zoneOffsetMinutes(new Date(guessUTC - o1 * 60_000), timeZone); // 2nd pass settles DST edges
  return { instant: new Date(guessUTC - o2 * 60_000), offsetMin: o2 };
}

function fmtOffset(min: number): string {
  const sign = min >= 0 ? "+" : "-";
  const a = Math.abs(min);
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${sign}${p(Math.floor(a / 60))}:${p(a % 60)}`;
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

// ── Absolute instant ──

/**
 * Serialize an absolute instant to `yyyy-MM-ddTHH:mm:ss±HH:MM`.
 *
 * With `displayZone` (IANA), the value's LOCAL wall-clock fields are interpreted
 * IN that zone and the offset is that zone's offset at that wall clock (NOT the
 * browser's). Without `displayZone`, the browser offset is stamped (legacy path
 * for non-site instants).
 *
 * @returns the RFC 3339 string, or `undefined` for a null/undefined/invalid input.
 */
export function serializeInstant(date: Date | null | undefined, displayZone?: string): string | undefined {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return undefined;
  const y = date.getFullYear();
  const mo = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mi = date.getMinutes();
  const s = date.getSeconds();
  const offMin = displayZone
    ? zonedFieldsToInstant(y, mo, d, h, mi, s, displayZone).offsetMin
    : -date.getTimezoneOffset();
  return `${y}-${pad2(mo)}-${pad2(d)}T${pad2(h)}:${pad2(mi)}:${pad2(s)}${fmtOffset(offMin)}`;
}

/**
 * Legacy name preserved (browser offset). Alias of the zone-less
 * {@link serializeInstant} path.
 *
 * @returns the RFC 3339 string, or `undefined` for a null/undefined/invalid input.
 */
export function serializeRfc3339Local(date: Date | null | undefined): string | undefined {
  return serializeInstant(date);
}

/**
 * Parse an offset-aware / instant value and return a FLOATING `Date` whose LOCAL
 * fields equal the wall clock IN `displayZone` (so a picker renders the site's
 * wall clock in any viewer zone). Without `displayZone`, the true instant is
 * returned (legacy; the caller reads browser getters). Accepts a string,
 * number(ms), or Date.
 *
 * @remarks
 * The floating-carrier result's `getTime()` is the browser misreading of the
 * zone wall clock. Serialize it via {@link serializeInstant} / {@link asZonedInstant}
 * (both read LOCAL fields), NEVER via `toISOString()` / `getTime()`.
 *
 * @returns the reprojected/true `Date`, or `undefined` for a null/invalid input.
 */
export function decodeInstant(
  value: string | number | Date | null | undefined,
  displayZone?: string,
): Date | undefined {
  if (value == null) return undefined;
  const inst = value instanceof Date ? value : new Date(typeof value === "string" ? value.trim() : value);
  if (Number.isNaN(inst.getTime())) return undefined;
  if (!displayZone) return inst;
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: displayZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const m: Record<string, number> = {};
  for (const p of dtf.formatToParts(inst)) if (p.type !== "literal") m[p.type] = Number(p.value);
  return new Date(m.year, m.month - 1, m.day, m.hour, m.minute, m.second); // floating carrier
}

/**
 * Legacy name preserved: pure offset-aware instant parse (no zone reprojection).
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

/**
 * Tag a FLOATING instant `Date` (local fields = display-zone wall clock) so JSON
 * serialization emits {@link serializeInstant}(this, displayZone). Reads LOCAL
 * fields for `toJSON` — its `getTime()` is intentionally the browser misreading
 * and must never be used for serialization.
 *
 * @remarks
 * Same caveat as {@link asPlainDate}: survives object spread, NOT
 * `String()` / `structuredClone`. Mutates and returns the SAME instance.
 */
export function asZonedInstant(date: Date, displayZone: string): Date {
  Object.defineProperty(date, "toJSON", {
    value(this: Date): string | undefined {
      return serializeInstant(this, displayZone);
    },
    configurable: true,
    writable: true,
    enumerable: false,
  });
  return date;
}

// ── Calendar date ──

/**
 * Serialize a calendar date to bare `yyyy-MM-dd` from LOCAL fields (zone-neutral).
 * Canonical name for {@link toLocalDateString}.
 *
 * @returns the `yyyy-MM-dd` string, or `undefined` for a null/undefined/invalid input.
 */
export function serializeCalendarDate(date: Date | null | undefined): string | undefined {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return undefined;
  return toLocalDateString(date);
}

/**
 * Decode a textual `yyyy-MM-dd` into a local-midnight floating `Date` tagged via
 * {@link asPlainDate}. Restores from the string's OWN components — NO local-getter
 * reinterpretation.
 *
 * @returns the tagged local-midnight `Date`, or `undefined` for a null/malformed input.
 */
export function decodeCalendarDate(value: string | null | undefined): Date | undefined {
  if (value == null) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? undefined : asPlainDate(d);
}

// ── Wall-clock time ──

/**
 * Serialize a wall-clock time to `HH:mm` (or `HH:mm:ss` with `opts.seconds`).
 *
 * @returns the `HH:mm[:ss]` string, or `undefined` for a null/invalid input.
 */
export function serializeWallClockTime(
  time: TimeValue | null | undefined,
  opts?: { seconds?: boolean },
): string | undefined {
  if (!time || !Number.isInteger(time.hours) || !Number.isInteger(time.minutes)) return undefined;
  const base = `${pad2(time.hours)}:${pad2(time.minutes)}`;
  return opts?.seconds ? `${base}:00` : base;
}

/**
 * Decode a textual `HH:mm[:ss]` into a {@link TimeValue} (seconds are dropped).
 *
 * @returns the `TimeValue`, or `undefined` for a null/out-of-range/malformed input.
 */
export function decodeWallClockTime(value: string | null | undefined): TimeValue | undefined {
  if (value == null) return undefined;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value.trim());
  if (!m) return undefined;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return undefined;
  return { hours, minutes };
}

/**
 * Format a wall-clock time — an `HH:mm[:ss]` string or a {@link TimeValue} — as a
 * localized time of day (AM/PM where the locale uses it), independent of any calendar
 * day or timezone. A fixed synthetic date carries the time into `Intl` purely for
 * formatting; only the time-of-day is meaningful.
 *
 * @returns the localized time, or `undefined` for a null/malformed input.
 */
export function formatWallClockTime(
  value: string | TimeValue | null | undefined,
  locale?: string,
): string | undefined {
  const time = typeof value === "string" ? decodeWallClockTime(value) : value ?? undefined;
  if (!time || !Number.isInteger(time.hours) || !Number.isInteger(time.minutes)) return undefined;
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" })
    .format(new Date(2000, 0, 1, time.hours, time.minutes));
}
