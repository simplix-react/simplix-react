import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

/** Options for the {@link useVirtualList} hook. */
export interface UseVirtualListOptions {
  /** Total number of items. */
  count: number;
  /** Estimated height (px) per row for initial layout. */
  estimateSize: () => number;
  /** Ref to the scrollable parent container. */
  parentRef: RefObject<HTMLElement | null>;
  /** Number of extra rows to render outside the viewport. Defaults to `5`. */
  overscan?: number;
}

/**
 * Virtual scrolling hook for large lists, wrapping `@tanstack/react-virtual`.
 *
 * @param options - {@link UseVirtualListOptions}
 * @returns `virtualizer` instance, `virtualRows` to render, and `totalHeight` for spacer.
 *
 * @example
 * ```ts
 * const { virtualRows, totalHeight } = useVirtualList({
 *   count: items.length,
 *   estimateSize: () => 48,
 *   parentRef: scrollRef,
 * });
 * ```
 */
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
