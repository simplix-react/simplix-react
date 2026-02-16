import { ApiError, defaultFetch } from "@simplix-react/contract";
import type { FetchFn } from "@simplix-react/contract";
import type { AuthConfig } from "./types.js";
import { RefreshManager } from "./helpers/refresh-manager.js";

const QUERY_PARAMS_HEADER = "X-Auth-Query-Params";

/**
 * Creates an authenticated {@link FetchFn} that wraps a base fetch function.
 *
 * Injects auth headers from all configured schemes, handles 401 responses
 * with single-flight token refresh, and retries the original request.
 *
 * @param config - Auth configuration with schemes and retry settings.
 * @param baseFetchFn - Base fetch function to wrap. Defaults to {@link defaultFetch}.
 * @returns An authenticated {@link FetchFn} for use with `defineApi`.
 *
 * @example
 * ```ts
 * const fetchFn = createAuthFetch({
 *   schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
 *   onRefreshFailure: () => redirectToLogin(),
 * });
 *
 * const api = defineApi(config, { fetchFn });
 * ```
 */
export function createAuthFetch(
  config: AuthConfig,
  baseFetchFn: FetchFn = defaultFetch,
): FetchFn {
  const { schemes, maxRetries = 1, onRefreshFailure } = config;
  const refreshManager = new RefreshManager(schemes);

  async function mergeHeaders(): Promise<Record<string, string>> {
    const merged: Record<string, string> = {};

    for (const scheme of schemes) {
      const headers = await scheme.getHeaders();
      Object.assign(merged, headers);
    }

    return merged;
  }

  function injectQueryParams(path: string, headers: Record<string, string>): string {
    const queryParamValue = headers[QUERY_PARAMS_HEADER];
    if (!queryParamValue) return path;

    delete headers[QUERY_PARAMS_HEADER];
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${queryParamValue}`;
  }

  async function buildAndFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers = await mergeHeaders();
    const resolvedPath = injectQueryParams(path, headers);
    return baseFetchFn<T>(resolvedPath, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });
  }

  async function handleRefresh(): Promise<void> {
    try {
      await refreshManager.refresh();
    } catch (refreshError) {
      onRefreshFailure?.(
        refreshError instanceof Error
          ? refreshError
          : new Error(String(refreshError)),
      );
      throw refreshError;
    }
  }

  return async function authFetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await buildAndFetch<T>(path, options);
      } catch (error) {
        lastError = error;
        if (!(error instanceof ApiError && error.status === 401) || attempt >= maxRetries) break;
        await handleRefresh();
      }
    }

    throw lastError;
  };
}
