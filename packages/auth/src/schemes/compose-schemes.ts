import type { AuthScheme } from "../types.js";

/**
 * Composes multiple {@link AuthScheme}s into a single scheme.
 *
 * Headers from all schemes are merged (later schemes override earlier ones
 * for conflicting header names). Refresh attempts each scheme in order.
 *
 * @example
 * ```ts
 * const composed = composeSchemes(
 *   bearerScheme({ store, token: () => store.get("access_token") }),
 *   apiKeyScheme({ in: "header", name: "X-API-Key", key: "sk-abc" }),
 * );
 * ```
 */
export function composeSchemes(...schemes: AuthScheme[]): AuthScheme {
  return {
    name: schemes.map((s) => s.name).join("+"),

    async getHeaders() {
      const headers: Record<string, string> = {};

      for (const scheme of schemes) {
        const schemeHeaders = await scheme.getHeaders();
        Object.assign(headers, schemeHeaders);
      }

      return headers;
    },

    async refresh() {
      for (const scheme of schemes) {
        if (scheme.refresh) {
          await scheme.refresh();
          return;
        }
      }
    },

    isAuthenticated() {
      return schemes.some((s) => s.isAuthenticated());
    },

    clear() {
      for (const scheme of schemes) {
        scheme.clear();
      }
    },
  };
}
