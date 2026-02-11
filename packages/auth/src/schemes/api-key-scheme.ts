import type { ApiKeySchemeOptions, AuthScheme } from "../types.js";

/**
 * Creates an API Key {@link AuthScheme}.
 *
 * Attaches the API key as a request header. When `in` is `"query"`,
 * the key is appended as a query parameter via a custom header that
 * the fetch wrapper intercepts.
 *
 * @example
 * ```ts
 * const scheme = apiKeyScheme({
 *   in: "header",
 *   name: "X-API-Key",
 *   key: "sk-abc123",
 * });
 * ```
 */
export function apiKeyScheme(options: ApiKeySchemeOptions): AuthScheme {
  const { name, key } = options;

  function resolveKey(): string | null {
    if (typeof key === "function") {
      return key();
    }
    return key;
  }

  return {
    name: "api-key",

    async getHeaders() {
      const currentKey = resolveKey();
      if (!currentKey) return Object.create(null) as Record<string, string>;

      if (options.in === "header") {
        return { [name]: currentKey };
      }

      // For query params, encode in a special header that createAuthFetch interprets
      return { "X-Auth-Query-Params": `${name}=${encodeURIComponent(currentKey)}` };
    },

    isAuthenticated() {
      return resolveKey() !== null;
    },

    clear() {
      // API keys are typically static; nothing to clear
    },
  };
}
