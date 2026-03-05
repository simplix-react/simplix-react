import { useEffect } from "react";

/**
 * Registers a beforeunload handler when enabled.
 * Use with isDirty state to prevent accidental tab close.
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
