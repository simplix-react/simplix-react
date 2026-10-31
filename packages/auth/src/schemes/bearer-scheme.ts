import type { AuthScheme, BearerSchemeOptions, RefreshLock, TokenPair } from "../types.js";
import { AuthError } from "../errors.js";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, EXPIRES_AT_KEY, REFRESH_EXPIRES_AT_KEY, storeTokenPair } from "../helpers/token-storage.js";
import { AutoRefreshScheduler } from "../helpers/auto-refresh-scheduler.js";

/**
 * Creates a Bearer token {@link AuthScheme}.
 *
 * Attaches an `Authorization: Bearer <token>` header to each request.
 * Optionally supports proactive token refresh before expiry. Every refresh path (the background
 * schedule, the proactive refresh in `getHeaders`, and `refresh()` after a 401) shares one
 * in-flight refresh, and with `lockName` the tabs sharing the store share it too: a tab that
 * finds the store already refreshed by another uses those tokens instead of calling the issuer.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * const scheme = bearerScheme({
 *   store,
 *   token: () => store.get("access_token"),
 *   refresh: {
 *     refreshFn: async () => {
 *       const res = await fetch("/auth/refresh", { method: "POST" });
 *       return res.json();
 *     },
 *   },
 * });
 * ```
 */
/** The Web Locks API where the runtime has it; otherwise no cross-tab lock. */
const webLock: RefreshLock | undefined = (() => {
  const locks = (globalThis as { navigator?: { locks?: { request?: unknown } } }).navigator?.locks;
  if (!locks || typeof locks.request !== "function") return undefined;
  const request = locks.request.bind(locks) as <T>(name: string, run: () => Promise<T>) => Promise<T>;
  return (name, run) => request(name, run);
})();

export function bearerScheme(options: BearerSchemeOptions): AuthScheme {
  const { store, token, refresh } = options;

  const lock = refresh?.lock ?? webLock;
  const lockName = refresh?.lockName;
  const activity = refresh?.activity;

  let inflight: Promise<void> | null = null;
  // When the tokens were last stored, by this tab or another: activity after it is what earns
  // the next scheduled refresh.
  let storedAt = Date.now();
  let stopWaiting: (() => void) | null = null;

  function resolveToken(): string | null {
    if (typeof token === "function") {
      return token();
    }
    return token;
  }

  function isExpiringSoon(): boolean {
    if (!refresh?.refreshBeforeExpiry) return false;

    const expiresAt = store.get(EXPIRES_AT_KEY);
    if (!expiresAt) return false;

    const expiresAtMs = Number(expiresAt);
    const bufferMs = refresh.refreshBeforeExpiry * 1000;

    return Date.now() >= expiresAtMs - bufferMs;
  }

  /** The one refresh every path goes through, single-flight in this tab and across tabs. */
  function runRefresh(): Promise<void> {
    if (!refresh) {
      return Promise.reject(new AuthError("REFRESH_FAILED", "Bearer scheme has no refresh configuration"));
    }
    if (inflight) return inflight;
    const startedWith = store.get(REFRESH_TOKEN_KEY);
    const exchange = async () => {
      // Another tab may have refreshed while this one waited for the lock; its tokens are in the
      // shared store, and sending the refresh token it replaced would only spend a request.
      const current = store.get(REFRESH_TOKEN_KEY);
      if (startedWith !== null && current !== null && current !== startedWith) return;
      const pair: TokenPair = await refresh.refreshFn();
      storeTokenPair(store, pair);
    };
    inflight = (lock && lockName ? lock(lockName, exchange) : exchange())
      .then(() => {
        storedAt = Date.now();
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  }

  const scheduler = refresh?.autoSchedule
    ? new AutoRefreshScheduler({
        refreshBeforeExpirySeconds: refresh.refreshBeforeExpiry,
        minIntervalSeconds: refresh.minIntervalSeconds,
        onRefreshFailed: refresh.onScheduledRefreshFailed,
      })
    : null;

  function expiresAt(): number | null {
    const raw = store.get(EXPIRES_AT_KEY);
    return raw ? Number(raw) : null;
  }

  /** Nobody was active since the tokens were stored: wait for the next activity, then refresh. */
  function waitForActivity(): void {
    if (!activity || stopWaiting) return;
    stopWaiting = activity.onActivity(() => {
      stopWaiting?.();
      stopWaiting = null;
      void runRefresh().then(arm, (error: unknown) => {
        if (error instanceof TypeError) arm();
        else refresh?.onScheduledRefreshFailed?.(error);
      });
    });
  }

  async function scheduledRefresh(): Promise<TokenPair | null> {
    if (activity && activity.lastActivityAt() <= storedAt) {
      waitForActivity();
      return null;
    }
    await runRefresh();
    return { accessToken: store.get(ACCESS_TOKEN_KEY) ?? "" };
  }

  function arm(): void {
    if (!scheduler) return;
    stopWaiting?.();
    stopWaiting = null;
    scheduler.start(scheduledRefresh, expiresAt);
  }

  arm();

  return {
    name: "bearer",

    async getHeaders() {
      if (refresh && isExpiringSoon()) {
        try {
          await runRefresh();
        } catch {
          // Proactive refresh failed; proceed with current token and let a 401 decide.
        }
      }

      const currentToken = resolveToken();
      if (!currentToken) return Object.create(null) as Record<string, string>;

      return { Authorization: `Bearer ${currentToken}` };
    },

    async refresh() {
      await runRefresh();
      arm();
    },

    isAuthenticated() {
      return resolveToken() !== null;
    },

    tokensChanged() {
      storedAt = Date.now();
      arm();
    },

    clear() {
      scheduler?.stop();
      stopWaiting?.();
      stopWaiting = null;
      store.remove(ACCESS_TOKEN_KEY);
      store.remove(REFRESH_TOKEN_KEY);
      store.remove(EXPIRES_AT_KEY);
      store.remove(REFRESH_EXPIRES_AT_KEY);
    },
  };
}
