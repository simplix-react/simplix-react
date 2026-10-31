import type { ActivitySource } from "../types.js";

export interface ActivityTrackerOptions {
  /** Element or window to listen on. Defaults to `window`. */
  target?: Pick<EventTarget, "addEventListener" | "removeEventListener">;
  /** Events that count as activity. */
  events?: readonly string[];
}

const DEFAULT_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll", "focus"] as const;

/**
 * Tracks when the user last interacted with the page, for an activity-aware token refresh.
 *
 * Page load counts as activity. A tab coming back into view counts too, since the user is looking
 * at it again.
 *
 * @example
 * ```ts
 * const activity = createActivityTracker();
 * bearerScheme({ store, token, refresh: { refreshFn, autoSchedule: true, activity } });
 * ```
 */
export function createActivityTracker(
  options: ActivityTrackerOptions = {},
): ActivitySource & { stop(): void } {
  const target = options.target ?? window;
  const events = options.events ?? DEFAULT_EVENTS;
  let last = Date.now();
  const listeners = new Set<() => void>();

  const onEvent = () => {
    last = Date.now();
    for (const listener of [...listeners]) listener();
  };
  const onVisibility = () => {
    if (typeof document !== "undefined" && document.visibilityState === "visible") onEvent();
  };

  for (const event of events) target.addEventListener(event, onEvent, { passive: true, capture: true });
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);

  return {
    lastActivityAt: () => last,
    onActivity(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    stop() {
      for (const event of events) target.removeEventListener(event, onEvent, { capture: true });
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
      listeners.clear();
    },
  };
}
