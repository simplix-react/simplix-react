import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import type { AccessPolicy } from "../types.js";

/**
 * Minimal interface for an auth instance.
 *
 * @remarks
 * Avoids a hard dependency on `@simplix-react/auth` by defining
 * only the methods required for synchronization. Any auth implementation
 * that satisfies this interface can be passed to {@link AccessProvider}.
 *
 * @example
 * ```ts
 * import { createAuth, bearerScheme } from "@simplix-react/auth";
 *
 * // @simplix-react/auth satisfies AuthLike
 * const auth: AuthLike = createAuth({
 *   scheme: bearerScheme({ loginPath: "/api/auth/login" }),
 * });
 * ```
 */
export interface AuthLike {
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
  subscribe(listener: () => void): () => void;
}

/**
 * Props for {@link AccessProvider}.
 */
export interface AccessProviderProps extends PropsWithChildren {
  /** The access policy instance to provide to the tree. */
  policy: AccessPolicy;
  /**
   * Optional auth instance for automatic synchronization.
   *
   * When provided, the provider subscribes to auth state changes
   * and updates/clears the policy accordingly.
   */
  auth?: AuthLike;
}

/**
 * Internal context that holds the policy reference.
 *
 * Uses `null` default so consumers can detect when the provider is absent.
 * Typed with `string` generics to accept any action/subject combination.
 * @internal
 */
export const AccessContext = createContext<AccessPolicy<string, string> | null>(
  null,
);

/**
 * Provides an {@link AccessPolicy} to the React component tree.
 *
 * @remarks
 * Optionally synchronizes with an auth instance: when the user logs in,
 * the policy is updated with the access token; when the user logs out,
 * the policy is cleared and public access rules are loaded.
 *
 * On mount, the provider calls `policy.rehydrate()` to restore
 * persisted state, then performs an initial sync with the auth instance.
 *
 * @param props - See {@link AccessProviderProps}.
 * @returns A React context provider wrapping children.
 *
 * @example
 * ```tsx
 * import { createAccessPolicy, createApiAdapter } from "@simplix-react/access";
 * import { AccessProvider } from "@simplix-react/access/react";
 *
 * const policy = createAccessPolicy({
 *   adapter: createApiAdapter({ endpoint: "/api/v1/permissions" }),
 * });
 *
 * function App() {
 *   return (
 *     <AccessProvider policy={policy} auth={auth}>
 *       <MyApp />
 *     </AccessProvider>
 *   );
 * }
 * ```
 *
 * @see {@link AccessProviderProps} for prop details.
 * @see {@link AuthLike} for the auth interface contract.
 */
export function AccessProvider({
  policy,
  auth,
  children,
}: AccessProviderProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!auth) return;

    async function sync() {
      if (auth!.isAuthenticated()) {
        const token = auth!.getAccessToken();
        if (token) {
          await policy.update(token);
        }
      } else {
        policy.clear();
        await policy.loadPublicAccess();
      }
    }

    // Initial sync on mount: rehydrate, then sync
    if (!initializedRef.current) {
      initializedRef.current = true;
      policy.rehydrate();
      void sync();
    }

    return auth.subscribe(() => {
      void sync();
    });
  }, [auth, policy]);

  return (
    <AccessContext.Provider value={policy}>{children}</AccessContext.Provider>
  );
}

/**
 * Returns the current {@link AccessPolicy} from context.
 *
 * @returns The policy from the nearest {@link AccessProvider}.
 * @throws Error if called outside an {@link AccessProvider}.
 * @internal
 */
export function useAccessContext(): AccessPolicy<string, string> {
  const policy = useContext(AccessContext);

  if (!policy) {
    throw new Error("useAccess must be used within an <AccessProvider>");
  }

  return policy;
}
