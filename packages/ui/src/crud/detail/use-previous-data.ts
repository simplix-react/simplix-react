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
  if (data != null) ref.current = data;
  return (data ?? ref.current) as T | undefined;
}
