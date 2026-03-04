import type { FetchFn } from "../types.js";
import { ApiError } from "./fetch.js";

export interface FetchContext {
  path: string;
  method: string;
}

export interface FetchErrorContext extends FetchContext {
  status: number;
}

export interface CreateFetchOptions {
  /**
   * Transforms the parsed JSON response before returning.
   * Receives the raw JSON and request context for endpoint-specific branching.
   *
   * @example
   * ```ts
   * createFetch({
   *   transformResponse: (json) => (json as any).body ?? json,
   * });
   * ```
   */
  transformResponse?: (json: unknown, context: FetchContext) => unknown;

  /**
   * Called when the response is not OK (non-2xx).
   * The response body is parsed as JSON when possible, otherwise raw text.
   * Throw a custom error to override the default {@link ApiError}.
   * If this function returns without throwing, the default ApiError is thrown.
   *
   * @example
   * ```ts
   * createFetch({
   *   onError: ({ status, body }) => {
   *     const env = body as { errorCode?: string; message?: string };
   *     if (env.errorCode) {
   *       throw new MyCustomError(status, env.errorCode, env.message);
   *     }
   *   },
   * });
   * ```
   */
  onError?: (context: FetchErrorContext & { body: unknown }) => void;
}

export function createFetch(options: CreateFetchOptions = {}): FetchFn {
  const { transformResponse, onError } = options;

  return async function <T>(path: string, reqOptions?: RequestInit): Promise<T> {
    const method = reqOptions?.method?.toUpperCase() ?? "GET";
    const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
    const headers: Record<string, string> = {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(reqOptions?.headers as Record<string, string>),
    };

    const res = await fetch(path, { ...reqOptions, headers });

    if (!res.ok) {
      const text = await res.text();

      if (onError) {
        let body: unknown = text;
        try { body = JSON.parse(text); } catch { /* use raw text */ }
        onError({ status: res.status, body, path, method });
      }

      throw new ApiError(res.status, text);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    const json = await res.json();

    if (transformResponse) {
      return transformResponse(json, { path, method }) as T;
    }

    return json as T;
  };
}
