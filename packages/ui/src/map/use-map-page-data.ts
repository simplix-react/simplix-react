import { useMemo } from "react";

interface UseMapPageDataOptions<T> {
  /** List hook result data array */
  data: T[];
  isLoading: boolean;
  /** Function to check if an item has valid coordinates */
  hasValidCoords: (item: T) => boolean;
}

interface UseMapPageDataReturn<T> {
  /** Items with valid coordinates */
  validItems: T[];
  isLoading: boolean;
}

export function useMapPageData<T>({
  data,
  isLoading,
  hasValidCoords,
}: UseMapPageDataOptions<T>): UseMapPageDataReturn<T> {
  const validItems = useMemo(
    () => data.filter(hasValidCoords),
    [data, hasValidCoords],
  );

  return { validItems, isLoading };
}
