/**
 * Represents an HTTP error response from the API.
 *
 * Thrown by {@link defaultFetch} and the internal multipart/blob fetchers when
 * the server responds with a non-2xx status code. Captures both the HTTP status
 * and the raw response body for debugging.
 *
 * @example
 * ```ts
 * import { ApiError } from "@simplix-react/contract";
 *
 * try {
 *   await api.client.task.get("nonexistent");
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.status); // 404
 *     console.log(error.body);   // "Not Found"
 *   }
 * }
 * ```
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status code of the failed response. */
    public readonly status: number,
    /** Raw response body text. */
    public readonly body: string,
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

/**
 * Performs an HTTP request with automatic JSON content-type headers and
 * `{ data: T }` envelope unwrapping.
 *
 * Serves as the built-in fetch implementation used by {@link deriveClient}
 * when no custom `fetchFn` is provided. Returns `undefined` for 204 No Content
 * responses and throws {@link ApiError} for non-2xx status codes.
 *
 * @typeParam T - The expected deserialized response type.
 * @param path - The full URL path to fetch.
 * @param options - Standard `RequestInit` options forwarded to the native `fetch`.
 * @returns The unwrapped response data.
 * @throws {@link ApiError} When the response status is not OK.
 *
 * @example
 * ```ts
 * import { defineApi, defaultFetch } from "@simplix-react/contract";
 *
 * // Use as-is (default behavior)
 * const api = defineApi(config);
 *
 * // Or provide a custom wrapper
 * const api = defineApi(config, {
 *   fetchFn: async (path, options) => {
 *     // Add auth header, then delegate to defaultFetch
 *     return defaultFetch(path, {
 *       ...options,
 *       headers: { ...options?.headers, Authorization: `Bearer ${token}` },
 *     });
 *   },
 * });
 * ```
 */
export async function defaultFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const method = options?.method?.toUpperCase();
  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
