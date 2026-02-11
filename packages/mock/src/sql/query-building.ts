import { camelToSnake } from "@simplix-react/contract";

/**
 * Represents the result of {@link buildSetClause}.
 *
 * Contains the SQL SET clause string, the ordered parameter values, and the next
 * available parameter index for appending additional conditions (e.g. a WHERE clause).
 *
 * @see {@link buildSetClause} - Produces this result.
 */
export interface SetClauseResult {
  /** The SQL SET clause string (e.g. `"name = $1, updated_at = NOW()"`). */
  clause: string;
  /** The ordered parameter values corresponding to the placeholders. */
  values: unknown[];
  /** The next available `$N` parameter index. */
  nextIndex: number;
}

/**
 * Builds a parameterized SQL SET clause from a partial update object.
 *
 * Converts camelCase object keys to snake_case column names, skips `undefined`
 * values, serializes nested objects as JSONB, and automatically appends
 * `updated_at = NOW()`.
 *
 * @typeParam T - The shape of the update DTO.
 * @param input - The partial object whose defined keys become SET assignments.
 * @param startIndex - The starting `$N` placeholder index.
 * @returns A {@link SetClauseResult} with the clause, values, and next index.
 *
 * @example
 * ```ts
 * import { buildSetClause } from "@simplix-react/mock";
 *
 * const { clause, values, nextIndex } = buildSetClause(
 *   { title: "Updated Task", status: "done" },
 * );
 * // clause:    "title = $1, status = $2, updated_at = NOW()"
 * // values:    ["Updated Task", "done"]
 * // nextIndex: 3
 *
 * const sql = `UPDATE tasks SET ${clause} WHERE id = $${nextIndex}`;
 * // sql: "UPDATE tasks SET title = $1, status = $2, updated_at = NOW() WHERE id = $3"
 * ```
 *
 * @see {@link SetClauseResult} - The return type.
 */
export function buildSetClause<T extends object>(
  input: T,
  startIndex = 1,
): SetClauseResult {
  const parts: string[] = [];
  const values: unknown[] = [];
  let index = startIndex;

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    const column = camelToSnake(key);

    if (typeof value === "object" && value !== null && !(value instanceof Date)) {
      // JSON fields
      parts.push(`${column} = $${index}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      parts.push(`${column} = $${index}`);
      values.push(value);
    }

    index++;
  }

  // Always update the timestamp
  parts.push("updated_at = NOW()");

  return {
    clause: parts.join(", "),
    values,
    nextIndex: index,
  };
}
