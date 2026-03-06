import type { FetchFn } from "../types.js";
import { createFetch } from "./create-fetch.js";

export { ApiError } from "./api-error.js";

// ── Global default fetch configuration ──

let _configuredFetchFn: FetchFn | undefined;

/** Sets the default fetch function used by all contracts without explicit fetchFn. */
export function configureDefaultFetch(fn: FetchFn): void {
  _configuredFetchFn = fn;
}

/** Returns the configured default fetch, falling back to defaultFetch. */
export function getDefaultFetch(): FetchFn {
  return _configuredFetchFn ?? defaultFetch;
}

/**
 * Default fetch with `{ data: T }` envelope unwrapping.
 * Built on {@link createFetch} as a preset configuration.
 */
export const defaultFetch: FetchFn = createFetch({
  transformResponse: (json) => {
    const obj = json as Record<string, unknown>;
    return obj.data !== undefined ? obj.data : json;
  },
});
