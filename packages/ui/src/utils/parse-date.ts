/** Value types that can be coerced to a Date. */
export type DateLike = Date | string | number;

/**
 * Parse a date-like value into a Date object.
 * Returns `undefined` for null, undefined, empty strings, or invalid dates.
 *
 * Supported inputs:
 * - `Date` object (passed through if valid)
 * - ISO 8601 string (`"2024-01-15"`, `"2024-01-15T10:30:00Z"`)
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
    if (!value.trim()) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}
