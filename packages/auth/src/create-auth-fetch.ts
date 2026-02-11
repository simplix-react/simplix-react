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

  return async function authFetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const authHeaders = await mergeHeaders();
    const finalPath = injectQueryParams(path, authHeaders);

    const mergedOptions: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
    };

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const freshHeaders = await mergeHeaders();
          const freshPath = injectQueryParams(path, freshHeaders);

          return await baseFetchFn<T>(freshPath, {
            ...options,
            headers: {
              ...freshHeaders,
              ...options?.headers,
            },
          });
        }

        return await baseFetchFn<T>(finalPath, mergedOptions);
      } catch (error) {
        lastError = error;

        const is401 =
          error instanceof ApiError && error.status === 401;

        if (!is401 || attempt >= maxRetries) {
          break;
        }

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
    }

    throw lastError;
  };
}
