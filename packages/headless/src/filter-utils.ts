import type { SearchOperator } from "./filter-types";

/**
 * Build a filter key from field name and operator.
 * Example: makeFilterKey("name", "contains") -> "name.contains"
 */
export function makeFilterKey(field: string, operator: SearchOperator | string): string {
  return `${field}.${operator}`;
}

/**
 * Parse a filter key back into field and operator.
 * Example: parseFilterKey("name.contains") -> { field: "name", operator: "contains" }
 */
export function parseFilterKey(key: string): { field: string; operator: string } | null {
  const dotIndex = key.indexOf(".");
  if (dotIndex === -1) return null;
  return {
    field: key.slice(0, dotIndex),
    operator: key.slice(dotIndex + 1),
  };
}

/**
 * Calculate filter layout: distribute N filters into rows.
 * Returns array of items-per-row.
 * Example: getFilterLayout(5) -> [3, 2]
 */
export function getFilterLayout(n: number): number[] {
  if (n <= 0) return [];
  if (n <= 3) return [n];
  if (n <= 6) {
    const half = Math.ceil(n / 2);
    return [half, n - half];
  }
  // For larger counts, use rows of 3-4
  const rows: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    const rowSize = remaining > 4 ? Math.min(4, Math.ceil(remaining / Math.ceil(remaining / 4))) : remaining;
    rows.push(rowSize);
    remaining -= rowSize;
  }
  return rows;
}

/**
 * Insert separator markers between filter groups for visual layout.
 * Adds { type: "separator" } items between groups based on getFilterLayout.
 */
export function insertFilterSeparators<T extends { type: string }>(
  filters: T[],
): (T | { type: "separator" })[] {
  const layout = getFilterLayout(filters.length);
  const result: (T | { type: "separator" })[] = [];
  let index = 0;

  for (let row = 0; row < layout.length; row++) {
    if (row > 0) {
      result.push({ type: "separator" });
    }
    for (let col = 0; col < layout[row]; col++) {
      if (index < filters.length) {
        result.push(filters[index]);
        index++;
      }
    }
  }

  return result;
}
