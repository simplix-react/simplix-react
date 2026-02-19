import { type RefObject, useEffect, useState } from "react";

/** Tracks the width of a container element via ResizeObserver. */
export function useContainerWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Synchronous initial read to prevent layout shift
    setWidth(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
