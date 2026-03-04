import type {
  AuthConfig,
  AuthInstance,
  TokenPair,
  TokenStore,
} from "@simplix-react/auth";
import type { OrvalMutator } from "@simplix-react/api";
import {
  createAuth,
  createAuthFetch,
  createCrossTabSync,
  bearerScheme,
  localStorageStore,
} from "@simplix-react/auth";
import { createAppFetch } from "@simplix-react/api";
import { createBootHttpFetch, type BootFetchOptions } from "./boot-fetch.js";
import { unwrapEnvelope, type BootEnvelope } from "./envelope.js";

export interface BootAuthOptions {
  storePrefix?: string;
  store?: TokenStore;
  basePath?: string;
  fetchFn?: OrvalMutator;
  fetchOptions?: BootFetchOptions;
  refreshBeforeExpiry?: number;
  onRefreshFailure?: (error: Error) => void;
  maxRetries?: number;
  /** Raw fetch options for non-Boot specs (401 retry included, Boot error handling excluded) */
  rawFetchOptions?: { baseUrl?: string };
  /** Background token auto-refresh. Defaults to true. */
  autoSchedule?: boolean;
  /** Cross-tab logout/token sync. Defaults to true. */
  crossTabSync?: boolean;
}

export interface BootAuthClient {
  loginFn: (username: string, password: string) => Promise<TokenPair>;
  refreshFn: () => Promise<TokenPair>;
  revokeFn: () => Promise<void>;
  userInfoFn: () => Promise<unknown>;
}

export interface BootAuthResult {
  auth: AuthInstance;
  authClient: BootAuthClient;
  store: TokenStore;
  baseFetch: OrvalMutator;
  /** Auth-wrapped fetch without Boot error handling (401 retry + proactive refresh included) */
  rawAuthFetch: OrvalMutator;
  /** Auth-wrapped fetch WITH Boot envelope unwrapping (for Boot domain packages) */
  bootMutator: OrvalMutator;
  getToken: () => string | null;
}

interface SpringTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

function parseTokenResponse(raw: SpringTokenResponse): TokenPair {
  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken,
    expiresAt: raw.accessTokenExpiry,
    refreshTokenExpiresAt: raw.refreshTokenExpiry,
  };
}

export function createBootAuth(options: BootAuthOptions = {}): BootAuthResult {
  const store =
    options.store ?? localStorageStore(options.storePrefix ?? "simplix:");
  const baseFetch = options.fetchFn ?? createBootHttpFetch(options.fetchOptions);
  const basePath = options.basePath ?? "/api/v1";

  // refreshFn: baseFetch 직접 사용 (auth 래핑 경유 금지)
  async function refreshFn(): Promise<TokenPair> {
    const refreshToken = store.get("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const raw = await baseFetch<SpringTokenResponse>(
      `${basePath}/auth/token/refresh`,
      {
        method: "GET",
        headers: { "X-Refresh-Token": refreshToken },
      },
    );
    return parseTokenResponse(raw);
  }

  // Wrap onRefreshFailure to clear stale tokens before user callback.
  // Without this, a full page reload re-triggers the scheduler with
  // the same expired expires_at, causing an infinite refresh loop.
  const userOnRefreshFailure =
    options.onRefreshFailure ?? (() => { window.location.href = "/login"; });
  const onRefreshFailure = (error: Error) => {
    // scheme is captured by reference — assigned below but always
    // available by the time this callback fires.
    scheme.clear();
    userOnRefreshFailure(error);
  };

  // Extract bearer scheme for reuse
  const scheme = bearerScheme({
    store,
    token: () => store.get("access_token"),
    refresh: {
      refreshFn,
      refreshBeforeExpiry: options.refreshBeforeExpiry ?? 60,
      autoSchedule: options.autoSchedule ?? true,
      minIntervalSeconds: 30,
      onScheduledRefreshFailed: () =>
        onRefreshFailure(new Error("Scheduled token refresh failed")),
    },
  });

  // Shared auth config for both createAuth and createAuthFetch
  const authFetchConfig = {
    schemes: [scheme],
    onRefreshFailure,
    maxRetries: options.maxRetries,
  };

  const auth = createAuth({
    ...authFetchConfig,
    store,
    fetchFn: baseFetch,
  });

  // Raw auth fetch: 401 retry included, Boot error handling excluded
  let rawAuthFetch: OrvalMutator;
  if (options.rawFetchOptions) {
    const rawBaseFetch = createAppFetch({
      baseUrl: options.rawFetchOptions.baseUrl,
      getToken: () => store.get("access_token"),
    });
    rawAuthFetch = createAuthFetch(
      authFetchConfig as AuthConfig,
      rawBaseFetch as unknown as Parameters<typeof createAuthFetch>[1],
    ) as unknown as OrvalMutator;
  } else {
    rawAuthFetch = baseFetch;
  }

  // Cross-tab sync
  if (options.crossTabSync ?? true) {
    const crossTab = createCrossTabSync({
      storageKey: `${options.storePrefix ?? "simplix:"}access_token`,
      onExternalLogout: () => auth.clear(),
      onExternalTokenUpdate: () => {},
    });
    crossTab.start();
  }

  const authClient: BootAuthClient = {
    loginFn: async (username, password) => {
      const raw = await baseFetch<SpringTokenResponse>(
        `${basePath}/auth/token/issue`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        },
      );
      return parseTokenResponse(raw);
    },
    refreshFn,
    revokeFn: async () => {
      const refreshToken = store.get("refresh_token");
      await (auth.fetchFn as OrvalMutator)<void>(
        `${basePath}/auth/token/revoke`,
        {
          method: "POST",
          headers: refreshToken ? { "X-Refresh-Token": refreshToken } : undefined,
        },
      );
    },
    userInfoFn: async () => {
      const envelope = await (auth.fetchFn as OrvalMutator)<BootEnvelope>(
        `${basePath}/user/me`,
        { method: "GET" },
      );
      return unwrapEnvelope(envelope);
    },
  };

  const getToken = () => store.get("access_token");

  // Boot mutator: auth.fetchFn + envelope unwrapping (for Boot domain packages)
  const bootMutator = (async (url: string, options?: RequestInit) => {
    const envelope = await (auth.fetchFn as OrvalMutator)(url, options);
    return unwrapEnvelope(envelope);
  }) as OrvalMutator;

  return { auth, authClient, store, baseFetch, rawAuthFetch, bootMutator, getToken };
}
