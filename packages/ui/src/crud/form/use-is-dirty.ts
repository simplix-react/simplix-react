import { useMemo } from "react";

/**
 * Detect whether form values have changed via shallow comparison.
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
    return keys.some((key) => current[key] !== initial[key]);
  }, [current, initial]);
}
