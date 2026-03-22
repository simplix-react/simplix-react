import { useEffect, useRef, useState } from "react";

/**
 * Returns `true` for a short window after `updatedAt` changes,
 * enabling a visual "pulse" effect on freshly updated items.
 *
 * @param updatedAt - A timestamp (epoch ms) that changes when the item is updated.
 *   `undefined` while the data is loading — no pulse fires.
 * @param duration - How long the pulse stays active, in milliseconds. Defaults to 600.
 *
 * @returns `true` during the pulse window, `false` otherwise.
 *
 * @example
 * ```tsx
 * const pulsing = usePulseOnUpdate(item.updatedAt);
 * return <div className={pulsing ? "animate-pulse" : ""}>...</div>;
 * ```
 */
export function usePulseOnUpdate(
  updatedAt: number | undefined,
  duration = 600,
): boolean {
  const [pulsing, setPulsing] = useState(false);
  const prevRef = useRef(updatedAt);

  useEffect(() => {
    if (updatedAt === undefined) return;
    const shouldPulse = prevRef.current !== undefined && prevRef.current !== updatedAt;
    prevRef.current = updatedAt;
    if (!shouldPulse) return;
    setPulsing(true);
    const timer = setTimeout(() => setPulsing(false), duration);
    return () => clearTimeout(timer);
  }, [updatedAt, duration]);

  return pulsing;
}
