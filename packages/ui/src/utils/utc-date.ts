/**
 * UTC-midnight calendar-date helpers for `format:date-time` (`Instant`) backend
 * fields that semantically carry a DATE the operator picks at day granularity
 * (e.g. schedule / access-level / cardholder activation & deactivation dates).
 *
 * These are the datetime siblings of the `format:date` (`LocalDate`) helpers in
 * `./format-date` (`toLocalDateString`) and `./parse-date` (`asPlainDate`,
 * `parseDate`). The difference: a `LocalDate` field serializes to a bare
 * `yyyy-MM-dd`, but an `Instant` field requires a full ISO-8601 datetime string,
 * so these emit / read `yyyy-MM-ddT00:00:00.000Z` — the picked calendar day
 * anchored at UTC midnight, with NO timezone offset applied (so the day never
 * shifts). Use them ONLY for date-only-picked `Instant` fields; NEVER for a real
 * timestamp.
 */

/**
 * Serialize a locally-picked calendar `Date` as a zone-neutral UTC-midnight ISO
 * datetime string (`yyyy-MM-ddT00:00:00.000Z`), reading the LOCAL calendar
 * fields and re-emitting them at UTC midnight via {@link Date.UTC} — it does NOT
 * apply a timezone offset. A picked `2026-06-30` always yields
 * `2026-06-30T00:00:00.000Z`, never rolling the day (unlike
 * `picked.toISOString()`, which converts local midnight to UTC and shifts a day
 * west of UTC).
 *
 * @param picked - the local-midnight `Date` from a date-only picker
 * @param dayShift - days to add via `Date.UTC` arithmetic (month/year boundaries
 *   normalize). Use `1` to encode an INCLUSIVE end date as an exclusive
 *   next-midnight upper bound ("valid through 2026-06-30" → `2026-07-01T…Z`),
 *   which keeps a whole-day range correct regardless of the device's boundary
 *   comparison (`<` vs `<=`).
 * @returns the ISO string, or `undefined` for a null/undefined/invalid input.
 */
export function toUtcDateIso(picked: Date | null | undefined, dayShift = 0): string | undefined {
  if (!(picked instanceof Date) || Number.isNaN(picked.getTime())) return undefined;
  return new Date(
    Date.UTC(picked.getFullYear(), picked.getMonth(), picked.getDate() + dayShift),
  ).toISOString();
}

/**
 * Tag a `Date` so JSON serialization emits {@link toUtcDateIso}'s UTC-midnight
 * datetime instead of `Date.prototype.toJSON`'s raw `toISOString()`. This is the
 * `Instant`-field counterpart of `asPlainDate` (which emits `yyyy-MM-dd`).
 *
 * @remarks
 * Returns a CLONE with an own, non-enumerable `toJSON` (so the caller's state
 * `Date` is not mutated). The tag survives an object spread of its container (the
 * submit-path pattern) but MUST NOT be `String()`-coerced or `structuredClone`d
 * (either strips the own `toJSON`). The clone must be local-midnight of the
 * intended day, because `toJSON` reads its LOCAL calendar fields.
 *
 * @param dayShift - baked into the emitted value (e.g. `1` for an inclusive end
 *   date → exclusive next-midnight).
 */
export function asUtcDate(d: Date, dayShift = 0): Date {
  const clone = new Date(d.getTime());
  Object.defineProperty(clone, "toJSON", {
    value(this: Date): string | undefined {
      return toUtcDateIso(this, dayShift);
    },
    configurable: true,
    writable: true,
    enumerable: false,
  });
  return clone;
}

/**
 * Parse a UTC-midnight ISO datetime string (as produced by {@link toUtcDateIso} /
 * {@link asUtcDate}) back into a LOCAL calendar `Date` for a date-only picker,
 * reading the UTC calendar fields so the displayed day is zone-independent
 * (`2026-06-30T00:00:00Z` shows as `2026-06-30` in ANY viewer timezone; a naive
 * `new Date(iso)` would localize and could roll the day). Intentionally discards
 * the time-of-day — NEVER use for a real timestamp.
 *
 * @param dayShift - days to add (month/year boundaries normalize). Use `-1` to
 *   undo the `+1` an inclusive end date was stored with
 *   (`2026-07-01T00:00:00Z` → local `2026-06-30`).
 * @returns the local `Date`, or `undefined` for a null/undefined/empty/invalid input.
 */
export function fromUtcDateIso(value: string | null | undefined, dayShift = 0): Date | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const t = new Date(trimmed);
  if (Number.isNaN(t.getTime())) return undefined;
  return new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + dayShift);
}
