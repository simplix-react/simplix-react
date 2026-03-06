import { useEffect } from "react";

/**
 * Register a `beforeunload` handler to warn users before leaving the page.
 *
 * @param enabled - Whether the handler is active (typically bound to form dirty state).
 *
 * @example
 * ```ts
 * const isDirty = useIsDirty(current, initial);
 * useBeforeUnload(isDirty);
 * ```
 */
export function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);
}
