/**
 * Represents a raw database row with unknown column values.
 *
 * Used as the input type for row-mapping functions that convert snake_case
 * database columns to camelCase JavaScript properties.
 *
 * @see {@link mapRow} - Maps a single row.
 * @see {@link mapRows} - Maps an array of rows.
 */
export type DbRow = Record<string, unknown>;

/**
 * Converts a snake_case string to camelCase.
 *
 * @param str - The snake_case input string.
 * @returns The camelCase equivalent.
 *
 * @example
 * ```ts
 * import { toCamelCase } from "@simplix-react/mock";
 *
 * toCamelCase("created_at"); // "createdAt"
 * toCamelCase("project_id"); // "projectId"
 * ```
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case.
 *
 * @param str - The camelCase input string.
 * @returns The snake_case equivalent.
 *
 * @example
 * ```ts
 * import { toSnakeCase } from "@simplix-react/mock";
 *
 * toSnakeCase("createdAt"); // "created_at"
 * toSnakeCase("projectId"); // "project_id"
 * ```
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Maps a single database row from snake_case columns to a camelCase object.
 *
 * Columns ending in `_at` are automatically converted to `Date` objects.
 *
 * @typeParam T - The expected shape of the mapped object.
 * @param row - The raw database row with snake_case keys.
 * @returns The mapped object with camelCase keys.
 *
 * @example
 * ```ts
 * import { mapRow } from "@simplix-react/mock";
 *
 * const row = { id: "1", project_id: "p1", created_at: "2025-01-01T00:00:00Z" };
 * const mapped = mapRow<{ id: string; projectId: string; createdAt: Date }>(row);
 * // { id: "1", projectId: "p1", createdAt: Date("2025-01-01T00:00:00Z") }
 * ```
 *
 * @see {@link mapRows} - Maps an array of rows.
 * @see {@link toCamelCase} - Underlying case conversion.
 */
export function mapRow<T>(row: DbRow): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const camelKey = toCamelCase(key);

    if (
      (key.endsWith("_at") || key === "installed_at" || key === "last_seen_at") &&
      value !== null &&
      value !== undefined
    ) {
      result[camelKey] = new Date(value as string);
    } else {
      result[camelKey] = value;
    }
  }

  return result as T;
}

/**
 * Maps an array of database rows from snake_case to camelCase objects.
 *
 * Delegates to {@link mapRow} for each row.
 *
 * @typeParam T - The expected shape of each mapped object.
 * @param rows - The array of raw database rows.
 * @returns An array of mapped camelCase objects.
 *
 * @example
 * ```ts
 * import { mapRows } from "@simplix-react/mock";
 *
 * const rows = [
 *   { id: "1", task_name: "Build" },
 *   { id: "2", task_name: "Test" },
 * ];
 * const mapped = mapRows<{ id: string; taskName: string }>(rows);
 * // [{ id: "1", taskName: "Build" }, { id: "2", taskName: "Test" }]
 * ```
 */
export function mapRows<T>(rows: DbRow[]): T[] {
  return rows.map((row) => mapRow<T>(row));
}
