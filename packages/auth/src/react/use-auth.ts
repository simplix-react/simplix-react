import { useCallback, useMemo } from "react";
import type { TokenPair } from "../types.js";
import { useAuthContext, useAuthState } from "./auth-provider.js";

/**
 * Return type of {@link useAuth}.
 */
export interface UseAuthReturn {
  /** Whether the user is currently authenticated. */
  isAuthenticated: boolean;

  /** Stores tokens and notifies subscribers. */
  login(tokens: TokenPair): void;

  /** Clears all auth state and notifies subscribers. */
  logout(): void;

  /** Returns the current access token from the store, or `null`. */
  getAccessToken(): string | null;
}

/**
 * React hook for managing authentication state.
 *
 * Re-renders when auth state changes. Must be used within an {@link AuthProvider}.
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { isAuthenticated, login, logout } = useAuth();
 *
 *   if (isAuthenticated) {
 *     return <button onClick={logout}>Logout</button>;
 *   }
 *
 *   return (
 *     <button onClick={() => login({ accessToken: "abc" })}>
 *       Login
 *     </button>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const auth = useAuthContext();
  const isAuthenticated = useAuthState(auth);

  const login = useCallback(
    (tokens: TokenPair) => auth.setTokens(tokens),
    [auth],
  );
  const logout = useCallback(() => auth.clear(), [auth]);
  const getAccessToken = useCallback(() => auth.getAccessToken(), [auth]);

  return useMemo(
    () => ({ isAuthenticated, login, logout, getAccessToken }),
    [isAuthenticated, login, logout, getAccessToken],
  );
}
