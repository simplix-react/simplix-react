/** Filename MSW registers its worker under, in every app that installs one. */
const MOCK_WORKER_SCRIPT = "mockServiceWorker.js";

/**
 * Options for {@link stopMocking}.
 */
export interface StopMockingOptions {
  /**
   * Auth store prefix whose stored tokens are dropped when a stale worker is found. Mock
   * sign-in mints tokens that authenticate nothing on a real server, so leaving them behind
   * lands the app on a login page it was already trying to skip. Omit for apps that store
   * no tokens.
   */
  storePrefix?: string;
}

/**
 * Removes a mock service worker a previous mock-mode run left registered.
 *
 * <p>A service worker outlives the dev server that installed it. Boot an app against a real
 * server after a `VITE_ENABLE_MOCK=true` session and the old worker still answers every
 * request from fixtures: signing in fails against accounts that exist only in the mock, and
 * because the request never leaves the browser there is nothing in the server log to read.
 * Call this from the branch that decides NOT to install a worker, so clearing the flag is
 * enough to be rid of one.
 *
 * <p>Unregistering does not release the document a worker already controls, so a page still
 * under its control is reloaded. That happens at most once per stale worker — the next boot
 * finds no registration left to remove.
 *
 * @param options tokens to clear alongside the worker
 * @returns whether a reload was triggered, so the caller can skip rendering a page that is
 *     about to be replaced
 */
export async function stopMocking(options: StopMockingOptions = {}): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;

  const registrations = await navigator.serviceWorker.getRegistrations();
  const stale = registrations.filter((registration) =>
    [registration.active, registration.waiting, registration.installing].some((worker) =>
      worker?.scriptURL.includes(MOCK_WORKER_SCRIPT),
    ),
  );
  if (stale.length === 0) return false;

  await Promise.all(stale.map((registration) => registration.unregister()));
  clearStoredTokens(options.storePrefix);

  if (!navigator.serviceWorker.controller) return false;
  window.location.reload();
  return true;
}

function clearStoredTokens(storePrefix?: string): void {
  if (!storePrefix || typeof localStorage === "undefined") return;
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(storePrefix)) localStorage.removeItem(key);
  }
}
