import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

/** Options for {@link useFadeTransition}. */
export interface UseFadeTransitionOptions {
  /** Whether the detail panel is currently showing (e.g. `view === "detail"`). */
  active: boolean;
  /** The id of the item to display. */
  targetId: string | null;
  /** Fade duration in milliseconds. @defaultValue 200 */
  duration?: number;
}

/** Return type of {@link useFadeTransition}. */
export interface UseFadeTransitionResult {
  displayedId: string | null;
  fading: boolean;
  style: CSSProperties;
}

/**
 * Drives a fade-out → swap → fade-in transition when the displayed
 * detail item changes.  Pairs naturally with {@link useListDetailState}.
 *
 * @example
 * ```tsx
 * const state = useListDetailState();
 * const fade = useFadeTransition({
 *   active: state.view === "detail",
 *   targetId: state.selectedId,
 * });
 * ```
 */
export function useFadeTransition(
  options: UseFadeTransitionOptions,
): UseFadeTransitionResult {
  const { active, targetId, duration = 200 } = options;

  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!active || !targetId) {
      clearTimeout(timerRef.current);
      setDisplayedId(active ? targetId : null);
      setFading(false);
      return;
    }

    // First selection or same item
    if (!displayedId || displayedId === targetId) {
      setDisplayedId(targetId);
      return;
    }

    // Different item: fade out → swap → fade in
    setFading(true);
    timerRef.current = setTimeout(() => {
      setDisplayedId(targetId);
      setFading(false);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [active, targetId, displayedId, duration]);

  const style: CSSProperties = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: fading ? 0 : 1,
  };

  return { displayedId, fading, style };
}
