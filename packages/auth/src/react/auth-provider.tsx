import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { AuthInstance } from "../types.js";

const AuthContext = createContext<AuthInstance | null>(null);
const AuthLoadingContext = createContext<boolean>(false);

/**
 * Props for {@link AuthProvider}.
 */
export interface AuthProviderProps {
  /** Auth instance created by {@link createAuth}. */
  auth: AuthInstance;
  children: ReactNode;
  /** Async function that loads the current user after rehydration. */
  userLoader?: (accessToken: string) => Promise<unknown>;
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
 *     <AuthProvider auth={auth} userLoader={fetchCurrentUser}>
 *       <MyApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ auth, children, userLoader }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(!!userLoader);

  useEffect(() => {
    if (!userLoader) return;

    let cancelled = false;

    async function init() {
      await auth.rehydrate();

      const token = auth.getAccessToken();
      if (token) {
        try {
          const user = await userLoader!(token);
          if (!cancelled) auth.setUser(user);
        } catch {
          if (!cancelled) auth.clear();
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [auth, userLoader]);

  return (
    <AuthContext.Provider value={auth}>
      <AuthLoadingContext.Provider value={isLoading}>
        {children}
      </AuthLoadingContext.Provider>
    </AuthContext.Provider>
  );
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
 * Returns the loading state from AuthProvider.
 * @internal
 */
export function useAuthLoading(): boolean {
  return useContext(AuthLoadingContext);
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
