import type { TokenStore } from "@simplix-react/auth";

/**
 * A {@link TokenStore} backed by asynchronous native storage.
 *
 * The framework `TokenStore` contract is synchronous while native storage
 * (expo-secure-store, AsyncStorage) is asynchronous, so native stores keep an
 * in-memory cache and MUST be hydrated once before first read:
 *
 * ```ts
 * const store = createSecureTokenStore();
 * await store.hydrate();   // before rendering anything that reads tokens
 * ```
 *
 * Reads before hydration throw — a token silently reported as absent would
 * send the user through re-authentication on every launch.
 */
export interface NativeTokenStore extends TokenStore {
  /** Load persisted entries into the in-memory cache. Idempotent. */
  hydrate(): Promise<void>;
  /** Whether {@link hydrate} has completed. */
  readonly hydrated: boolean;
}
