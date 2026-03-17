import { useRef } from "react";

/**
 * Retains the last non-nullish data so the UI stays populated while
 * a refetch is in flight (e.g. when switching between detail items).
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGet(id);
 * const displayData = usePreviousData(data);
 * ```
 */
export function usePreviousData<T>(data: T | null | undefined): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const isInvalidData = data != null && typeof data === "object" && !Array.isArray(data) && (
    Object.keys(data as object).length === 0 ||
    (data as Record<string, unknown>).type === "FAILURE"
  );
  if (data != null && !isInvalidData) ref.current = data;
  return (isInvalidData ? ref.current : (data ?? ref.current)) as T | undefined;
}
