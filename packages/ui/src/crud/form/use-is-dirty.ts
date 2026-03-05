import { useMemo } from "react";

/**
 * Shallow comparison of two objects to detect form dirty state.
 * For deep comparison needs, use useMemo directly.
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
