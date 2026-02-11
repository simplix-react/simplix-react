import { createContext, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { AuthInstance } from "../types.js";

const AuthContext = createContext<AuthInstance | null>(null);

/**
 * Props for {@link AuthProvider}.
 */
export interface AuthProviderProps {
  /** Auth instance created by {@link createAuth}. */
  auth: AuthInstance;
  children: ReactNode;
}

/**
 * Provides an {@link AuthInstance} to the React component tree.
 *
 * Must wrap any component that uses {@link useAuth} or {@link useAuthFetch}.
 *
 * @example
 * ```tsx
 * const auth = createAuth({ schemes: [...], store });
 *
 * function App() {
 *   return (
 *     <AuthProvider auth={auth}>
 *       <MyApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ auth, children }: AuthProviderProps) {
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Returns the current {@link AuthInstance} from context.
 *
 * @throws If called outside an {@link AuthProvider}.
 * @internal
 */
export function useAuthContext(): AuthInstance {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }

  return auth;
}

/**
 * Subscribes to auth state changes and returns a stable snapshot.
 *
 * Re-renders when `isAuthenticated` changes (via `auth.subscribe`).
 * @internal
 */
export function useAuthState(auth: AuthInstance): boolean {
  return useSyncExternalStore(
    auth.subscribe,
    () => auth.isAuthenticated(),
    () => false,
  );
}
