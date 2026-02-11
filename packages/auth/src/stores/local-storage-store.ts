import type { TokenStore } from "../types.js";
import { createWebStorageStore } from "./create-web-storage-store.js";

/**
 * Creates a {@link TokenStore} backed by `localStorage`.
 *
 * All keys are automatically prefixed to avoid collisions.
 * Tokens persist across browser sessions until explicitly cleared.
 *
 * @param prefix - Key prefix. Defaults to `"auth:"`.
 *
 * @example
 * ```ts
 * const store = localStorageStore("myapp:");
 * store.set("access_token", "abc");
 * // localStorage key: "myapp:access_token"
 * ```
 */
export function localStorageStore(prefix = "auth:"): TokenStore {
  return createWebStorageStore(localStorage, prefix);
}
