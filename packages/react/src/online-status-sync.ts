import { onlineManager } from "@tanstack/react-query";

/**
 * React Query's `onlineManager` caches a single `online` boolean that is only
 * ever written by the window `online` / `offline` events, and it detaches those
 * listeners whenever its subscriber count drops to zero. A missed `online`
 * event therefore leaves the manager reporting offline forever.
 *
 * That matters because the retryer only resumes a backed-off retry while
 * `focusManager.isFocused() && (networkMode === "always" || onlineManager.isOnline())`
 * holds — otherwise the fetch pauses. A query that failed once and hit a stale
 * offline flag stays paused for the lifetime of the page, and the only recovery
 * is a reload.
 *
 * `navigator.onLine` is the browser's own live value and is never stale, so it
 * is the authority the cached flag is repaired from.
 */

/**
 * Repairs React Query's cached connectivity flag from `navigator.onLine`.
 *
 * When the manager's cached value already matches the browser's, this is a
 * no-op — `onlineManager.setOnline` notifies its subscribers only on a real
 * change. When the value flips back to online, the `QueryClient`'s own
 * `onlineManager` subscription resumes every paused fetch and refetches the
 * queries that opted into `refetchOnReconnect`.
 *
 * Environments without `navigator.onLine` (server rendering, React Native) are
 * left untouched — there is no authority to repair the flag from.
 *
 * @returns Whether React Query reports the browser as online after the sync.
 *
 * @example
 * ```ts
 * import { resyncOnlineStatus } from "@simplix-react/react";
 *
 * // After a custom connectivity probe succeeds
 * resyncOnlineStatus();
 * ```
 */
export function resyncOnlineStatus(): boolean {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    onlineManager.setOnline(navigator.onLine);
  }
  return onlineManager.isOnline();
}

let activeStop: (() => void) | undefined;

/**
 * Keeps React Query's connectivity flag in sync with `navigator.onLine`.
 *
 * Syncs immediately, then again every time the document becomes visible —
 * the moment a user returns to a tab and expects a stalled list to work. Call
 * it once while composing the app's providers, next to the `QueryClient` the
 * app creates.
 *
 * Calling this again replaces the previous registration, so a module reloaded
 * by HMR never accumulates duplicate listeners.
 *
 * @returns A cleanup function that stops the sync.
 *
 * @example
 * ```ts
 * import { startOnlineStatusSync } from "@simplix-react/react";
 *
 * const queryClient = new QueryClient();
 * startOnlineStatusSync();
 * ```
 */
export function startOnlineStatusSync(): () => void {
  activeStop?.();

  resyncOnlineStatus();

  if (typeof document === "undefined" || typeof document.addEventListener !== "function") {
    activeStop = undefined;
    return () => {};
  }

  const handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      resyncOnlineStatus();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange, false);

  const stop = (): void => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    if (activeStop === stop) {
      activeStop = undefined;
    }
  };

  activeStop = stop;
  return stop;
}
