import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

/** Options for the {@link useVirtualList} hook. */
export interface UseVirtualListOptions {
  count: number;
  estimateSize: () => number;
  parentRef: RefObject<HTMLElement | null>;
  overscan?: number;
}

/** Virtual scrolling hook wrapping @tanstack/react-virtual for large list performance. */
export function useVirtualList(options: UseVirtualListOptions) {
  const { count, estimateSize, parentRef, overscan = 5 } = options;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  return {
    virtualizer,
    virtualRows: virtualizer.getVirtualItems(),
    totalHeight: virtualizer.getTotalSize(),
  };
}
