/**
 * Transform generic CRUD filter values to searchable-jpa compatible format.
 *
 * Handles:
 * - Array values → comma-separated string (e.g., `["A","B"]` → `"A,B"` for IN operator)
 * - ISO date strings → LocalDateTime format (strip `.000Z` suffix)
 * - gte/lte date pairs → single BETWEEN operator (optional merge)
 */
export function transformSearchableFilters(filters: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const gtePairs: Record<string, { gteKey: string; lteKey: string; gteVal?: string; lteVal?: string }> = {};

  // First pass: detect gte/lte date pairs
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;

    const gteMatch = key.match(/^(.+)\.greaterThanOrEqualTo$/);
    if (gteMatch && typeof value === "string" && isDateLike(value)) {
      const field = gteMatch[1];
      if (!gtePairs[field]) gtePairs[field] = { gteKey: key, lteKey: `${field}.lessThanOrEqualTo` };
      gtePairs[field].gteVal = value;
      continue;
    }

    const lteMatch = key.match(/^(.+)\.lessThanOrEqualTo$/);
    if (lteMatch && typeof value === "string" && isDateLike(value)) {
      const field = lteMatch[1];
      if (!gtePairs[field]) gtePairs[field] = { gteKey: `${field}.greaterThanOrEqualTo`, lteKey: key };
      gtePairs[field].lteVal = value;
      continue;
    }

    result[key] = transformValue(value);
  }

  // Second pass: merge gte/lte pairs into BETWEEN
  for (const [field, pair] of Object.entries(gtePairs)) {
    if (pair.gteVal && pair.lteVal) {
      result[`${field}.between`] = `${toLocalDateTime(pair.gteVal)},${toLocalDateTime(pair.lteVal)}`;
    } else if (pair.gteVal) {
      result[pair.gteKey] = toLocalDateTime(pair.gteVal);
    } else if (pair.lteVal) {
      result[pair.lteKey] = toLocalDateTime(pair.lteVal);
    }
  }

  return result;
}

function transformValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.join(",");
  }
  if (typeof value === "string" && isDateLike(value)) {
    return toLocalDateTime(value);
  }
  return value;
}

/** Check if a string looks like an ISO date (contains T and digits). */
function isDateLike(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

/** Convert ISO string (e.g. `2024-01-01T00:00:00.000Z`) to LocalDateTime (`2024-01-01T00:00:00`). */
function toLocalDateTime(iso: string): string {
  // Strip milliseconds and timezone suffix
  return iso.replace(/\.\d{3}Z$/, "").replace(/Z$/, "");
}
