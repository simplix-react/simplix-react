function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((item, index) => deepEqual(item, b[index]));
}

function objectsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  return keysA.length === Object.keys(b).length && keysA.every((key) => deepEqual(a[key], b[key]));
}

/**
 * Performs a deep equality check between two values.
 *
 * @remarks
 * Handles primitives, `Date`, `null`/`undefined`, arrays, and plain objects.
 * Does not support `Map`, `Set`, `RegExp`, or typed arrays.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns `true` if the values are deeply equal
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (Array.isArray(a) && Array.isArray(b)) return arraysEqual(a, b);
  if (isPlainObject(a) && isPlainObject(b)) return objectsEqual(a, b);
  return false;
}

/**
 * Extracts only the fields that differ between current and original objects.
 *
 * @remarks
 * Compares each top-level key using `deepEqual`. Only keys present in
 * `current` are checked — removed keys are not tracked.
 * Useful for PATCH requests where only changed fields should be sent.
 *
 * @param current - The current form values
 * @param original - The original entity data loaded from the server
 * @returns A partial object containing only the changed fields
 *
 * @example
 * ```ts
 * import { extractDirtyFields } from "@simplix-react/form";
 *
 * const dirty = extractDirtyFields(
 *   { name: "Updated", status: "active", priority: 1 },
 *   { name: "Original", status: "active", priority: 1 },
 * );
 * // => { name: "Updated" }
 * ```
 *
 * @see `deepEqual` (internal) — the comparison function used internally
 */
export function extractDirtyFields<T extends Record<string, unknown>>(
  current: T,
  original: T,
): Partial<T> {
  const dirty: Partial<T> = {};

  for (const key of Object.keys(current) as (keyof T)[]) {
    if (!deepEqual(current[key], original[key])) {
      dirty[key] = current[key];
    }
  }

  return dirty;
}
