import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { motionTokenMs } from "../../utils/motion-duration";

/** Options for {@link useFadeTransition}. */
export interface UseFadeTransitionOptions {
  /** Whether the detail panel is currently showing (e.g. `view === "detail"`). */
  active: boolean;
  /** The id of the item to display. */
  targetId: string | null;
  /**
   * Fade duration in milliseconds. When omitted the fade runs on the `--dur-base` motion token
   * (and `--ease`), so a design's timing and reduced motion apply.
   */
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
  const { active, targetId, duration } = options;

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
    }, duration ?? motionTokenMs("--dur-base"));

    return () => clearTimeout(timerRef.current);
  }, [active, targetId, displayedId, duration]);

  const style: CSSProperties = {
    transition: duration === undefined ? "opacity var(--dur-base) var(--ease)" : `opacity ${duration}ms var(--ease)`,
    opacity: fading ? 0 : 1,
  };

  return { displayedId, fading, style };
}
