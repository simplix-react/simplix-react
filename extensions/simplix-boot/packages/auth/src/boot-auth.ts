import type {
  AuthConfig,
  AuthInstance,
  TokenPair,
  TokenStore,
} from "@simplix-react/auth";
import type { FetchFn } from "@simplix-react/contract";
import { createFetch } from "@simplix-react/contract";
import {
  createAuth,
  createAuthFetch,
  createCrossTabSync,
  bearerScheme,
  localStorageStore,
} from "@simplix-react/auth";
import { createBootHttpFetch, type BootFetchOptions } from "./boot-fetch.js";
import { unwrapEnvelope, type BootEnvelope } from "./envelope.js";

export interface BootAuthOptions {
  storePrefix?: string;
  store?: TokenStore;
  basePath?: string;
  fetchFn?: FetchFn;
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
  baseFetch: FetchFn;
  /** Auth-wrapped fetch without Boot error handling (401 retry + proactive refresh included) */
  rawAuthFetch: FetchFn;
  /** Auth-wrapped fetch WITH Boot envelope unwrapping (for Boot domain packages) */
  bootMutator: FetchFn;
  getToken: () => string | null;
  /**
   * XHR-based multipart upload with real progress, auth headers, 401
   * refresh-retry, and Boot envelope unwrapping. Returns the unwrapped body.
   * (fetch cannot report upload progress, so attachments use XHR here.)
   */
  uploadWithProgress: <T = unknown>(
    url: string,
    formData: FormData,
    opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ) => Promise<T>;
  /** Authenticated blob fetch (attachment download/thumbnail) with 401 refresh-retry. */
  fetchAttachmentBlob: (url: string) => Promise<Blob>;
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
        method: "POST",
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
  let rawAuthFetch: FetchFn;
  if (options.rawFetchOptions) {
    const rawBaseFetch = createFetch({
      baseUrl: options.rawFetchOptions.baseUrl,
      getToken: () => store.get("access_token"),
    });
    rawAuthFetch = createAuthFetch(
      authFetchConfig as AuthConfig,
      rawBaseFetch,
    );
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
          method: "POST",
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
      await (auth.fetchFn as FetchFn)<void>(
        `${basePath}/auth/token/revoke`,
        {
          method: "POST",
          headers: refreshToken ? { "X-Refresh-Token": refreshToken } : undefined,
        },
      );
    },
    userInfoFn: async () => {
      const envelope = await (auth.fetchFn as FetchFn)<BootEnvelope>(
        `${basePath}/user/me`,
        { method: "GET" },
      );
      return unwrapEnvelope(envelope);
    },
  };

  const getToken = () => store.get("access_token");

  // Boot mutator: auth.fetchFn + envelope unwrapping (for Boot domain packages)
  const bootMutator = (async (url: string, options?: RequestInit) => {
    const envelope = await (auth.fetchFn as FetchFn)(url, options);
    return unwrapEnvelope(envelope);
  }) as FetchFn;

  // Attachment transport: XHR (progress) / fetch (blob) sharing the bearer
  // scheme's headers + 401 refresh-retry. baseUrl mirrors the Boot http fetch.
  const attachmentBaseUrl = options.fetchOptions?.baseUrl ?? "";

  async function withAuthRetry<T>(
    run: (headers: Record<string, string>) => Promise<T>,
  ): Promise<T> {
    try {
      return await run(await scheme.getHeaders());
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status === 401 && scheme.refresh) {
        await scheme.refresh();
        return run(await scheme.getHeaders());
      }
      throw error;
    }
  }

  function uploadWithProgress<T = unknown>(
    url: string,
    formData: FormData,
    opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ): Promise<T> {
    return withAuthRetry(
      (headers) =>
        new Promise<T>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", attachmentBaseUrl + url);
          for (const [key, value] of Object.entries(headers)) {
            xhr.setRequestHeader(key, value);
          }
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && opts?.onProgress) {
              opts.onProgress(Math.round((event.loaded / event.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(unwrapEnvelope<T>(JSON.parse(xhr.responseText)));
              } catch (parseError) {
                reject(parseError);
              }
            } else {
              const error = new Error(`HTTP ${xhr.status}`) as Error & { status: number };
              error.status = xhr.status;
              reject(error);
            }
          });
          xhr.addEventListener("error", () =>
            reject(new Error("Attachment upload network error")),
          );
          xhr.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
          if (opts?.signal) {
            if (opts.signal.aborted) {
              xhr.abort();
              reject(new DOMException("Aborted", "AbortError"));
              return;
            }
            opts.signal.addEventListener("abort", () => xhr.abort());
          }
          xhr.send(formData);
        }),
    );
  }

  function fetchAttachmentBlob(url: string): Promise<Blob> {
    return withAuthRetry(async (headers) => {
      const res = await fetch(attachmentBaseUrl + url, { headers });
      if (!res.ok) {
        const error = new Error(`HTTP ${res.status}`) as Error & { status: number };
        error.status = res.status;
        throw error;
      }
      return res.blob();
    });
  }

  return {
    auth,
    authClient,
    store,
    baseFetch,
    rawAuthFetch,
    bootMutator,
    getToken,
    uploadWithProgress,
    fetchAttachmentBlob,
  };
}
