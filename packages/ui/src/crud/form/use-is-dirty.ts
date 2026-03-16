import { useMemo } from "react";

/**
 * Compare two values with Date-aware logic.
 * Handles: primitives, null, undefined, Date objects, and Date-string cross-comparison.
 */
function isEqualValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Date || b instanceof Date) {
    const ta = a instanceof Date ? a.getTime() : typeof a === "string" ? new Date(a).getTime() : NaN;
    const tb = b instanceof Date ? b.getTime() : typeof b === "string" ? new Date(b).getTime() : NaN;
    if (!isNaN(ta) && !isNaN(tb)) return ta === tb;
  }
  return false;
}

/**
 * Detect whether form values have changed via shallow comparison.
 * Supports Date-aware comparison for date fields.
 *
 * @typeParam T - Form values object type.
 * @param current - Current form values.
 * @param initial - Initial (clean) form values.
 * @returns `true` if any top-level value differs.
 *
 * @example
 * ```ts
 * const isDirty = useIsDirty(formValues, initialValues);
 * useBeforeUnload(isDirty);
 * ```
 */
export function useIsDirty<T extends Record<string, unknown>>(
  current: T,
  initial: T,
): boolean {
  return useMemo(() => {
    const keys = Object.keys(current);
    return keys.some((key) => !isEqualValue(current[key], initial[key]));
  }, [current, initial]);
}
