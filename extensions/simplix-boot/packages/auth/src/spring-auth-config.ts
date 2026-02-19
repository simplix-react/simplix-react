import type { TokenPair } from "@simplix-react/auth";
import { defaultFetch } from "@simplix-react/contract";

import { parseSpringTokenResponse } from "./spring-token-response.js";
import type {
  SpringAuthOptions,
  SpringTokenResponse,
  SpringUser,
} from "./types.js";

const DEFAULT_LOGIN_ENDPOINT = "/api/v1/auth/token/issue";
const DEFAULT_REFRESH_ENDPOINT = "/api/v1/auth/token/refresh";
const DEFAULT_REVOKE_ENDPOINT = "/api/v1/auth/token/revoke";
const DEFAULT_USER_INFO_ENDPOINT = "/api/v1/user/me";

/**
 * Creates Spring Security auth callback functions for use with `@simplix-react/auth`.
 *
 * @remarks
 * Returns `loginFn`, `refreshFn`, `revokeFn`, and `userInfoFn` that communicate
 * with Spring Security endpoints. The `loginFn` uses Basic Auth for initial
 * token issuance.
 *
 * @param options - Configuration for endpoint URLs and custom fetch.
 * @returns An object containing auth callback functions.
 *
 * @example
 * ```ts
 * import { createSpringAuthConfig } from "@simplix-boot/auth";
 * import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
 *
 * const store = localStorageStore();
 * const spring = createSpringAuthConfig({ fetchFn: auth.fetchFn });
 *
 * const auth = createAuth({
 *   schemes: [bearerScheme({
 *     store,
 *     token: () => store.get("access_token"),
 *     refresh: { refreshFn: spring.refreshFn },
 *   })],
 *   store,
 * });
 * ```
 */
export function createSpringAuthConfig(options: SpringAuthOptions = {}) {
  const {
    loginEndpoint = DEFAULT_LOGIN_ENDPOINT,
    refreshEndpoint = DEFAULT_REFRESH_ENDPOINT,
    revokeEndpoint = DEFAULT_REVOKE_ENDPOINT,
    userInfoEndpoint = DEFAULT_USER_INFO_ENDPOINT,
    fetchFn = defaultFetch,
  } = options;

  async function loginFn(
    username: string,
    password: string,
  ): Promise<TokenPair> {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetchFn<SpringTokenResponse>(loginEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });
    return parseSpringTokenResponse(response);
  }

  async function refreshFn(): Promise<TokenPair> {
    const response = await fetchFn<SpringTokenResponse>(refreshEndpoint, {
      method: "POST",
    });
    return parseSpringTokenResponse(response);
  }

  async function revokeFn(): Promise<void> {
    await fetchFn<void>(revokeEndpoint, {
      method: "POST",
    });
  }

  async function userInfoFn(token: string): Promise<SpringUser> {
    return fetchFn<SpringUser>(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return { loginFn, refreshFn, revokeFn, userInfoFn };
}
