import { useCallback, useEffect, useRef, useState } from "react";

/** Which edges of a scroll box have content hidden past them. */
export interface ScrollEdges {
  /** Content is scrolled up under the top edge. */
  above: boolean;
  /** More content lies below the bottom edge. */
  below: boolean;
}

/**
 * Tracks whether a scroll box hides content past its top or bottom edge, so the strips above and
 * below it can mark the overlap. Re-measures on scroll and whenever the box or its content resizes.
 */
export function useScrollEdges<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>({ above: false, below: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const above = el.scrollTop > 0;
    // One pixel of slack: fractional layout leaves scrollHeight a subpixel past the box.
    const below = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    setEdges((prev) => (prev.above === above && prev.below === below ? prev : { above, below }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(el);
    if (el.firstElementChild) observer?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [enabled, measure]);

  return { ref, edges: enabled ? edges : { above: false, below: false } };
}
