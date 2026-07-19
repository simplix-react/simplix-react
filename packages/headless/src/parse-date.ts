import { toLocalDateString } from "./format-date";

/** Value types that can be coerced to a Date. */
export type DateLike = Date | string | number;

/**
 * Tag a Date so JSON serialization emits a zone-neutral calendar date
 * (local `yyyy-MM-dd`) instead of `Date.prototype.toJSON`'s UTC `toISOString()`.
 *
 * @remarks
 * Mutates and returns the SAME instance: an own, non-enumerable `toJSON`
 * shadows the prototype. Use ONLY for `LocalDate` (date-only, `format:date`)
 * values, NEVER for real timestamps (`Instant`/`LocalDateTime`).
 *
 * The returned Date is a serialization carrier for a `string` (`format:date`)
 * field: it MUST reach `JSON.stringify` intact and MUST NOT be `String()`-coerced
 * or run through `structuredClone` / a deep clone (either strips the own `toJSON`
 * and reverts to the UTC prototype `toJSON`, re-introducing an off-by-one).
 * Callers MUST only pass a Date that is local-midnight of the intended day
 * (calendar-emitted `new Date(y, m, d)` or {@link parseDate}'s date-only branch),
 * because the local getters read back the calendar day of that instance.
 */
export function asPlainDate(d: Date): Date {
  Object.defineProperty(d, "toJSON", {
    value(this: Date): string {
      return toLocalDateString(this);
    },
    configurable: true,
    writable: true,
    enumerable: false,
  });
  return d;
}

/**
 * Parse a date-like value into a Date object.
 * Returns `undefined` for null, undefined, empty strings, or invalid dates.
 *
 * Supported inputs:
 * - `Date` object (passed through if valid; a tag from {@link asPlainDate} is preserved)
 * - Date-only ISO string (`"2024-01-15"`) — parsed as a LOCAL calendar date and
 *   tagged via {@link asPlainDate}, so seeds and display stay zone-neutral. (Note:
 *   `new Date("2024-01-15")` would parse as UTC midnight and shift a day west of UTC.)
 * - Datetime / offset-aware ISO string (`"2024-01-15T10:30:00Z"`) — parsed with the
 *   native `new Date(value)` (UTC/offset-aware), UNCHANGED and never tagged.
 * - Unix timestamp in milliseconds (`1705276800000`)
 * - Unix timestamp in seconds (`1705276800`) — auto-detected if value < 1e12
 */
export function parseDate(value: DateLike | null | undefined): Date | undefined {
  if (value == null) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    // Date-only (LocalDate, format:date): parse as a LOCAL calendar date and
    // tag, so seeds and display stay zone-neutral. The anchored regex excludes
    // any string carrying a time/offset, which fall through to the native
    // UTC/offset-aware branch that datetime values (Instant) require.
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnly) {
      const local = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
      return Number.isNaN(local.getTime()) ? undefined : asPlainDate(local);
    }
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}
