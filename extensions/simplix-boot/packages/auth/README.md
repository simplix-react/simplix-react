# @simplix-boot/auth

Spring Security authentication adapter for `@simplix-react/auth`. Converts Spring Security token endpoints into simplix-react `TokenPair` and auth callback functions.

## Installation

```bash
pnpm add @simplix-boot/auth
```

> **Prerequisites:** Requires `@simplix-react/auth` and `@simplix-react/contract` as peer dependencies.

## Usage

### Create Auth Config

`createSpringAuthConfig()` returns callback functions (`loginFn`, `refreshFn`, `revokeFn`, `userInfoFn`) that communicate with Spring Security endpoints:

```ts
import { createSpringAuthConfig } from "@simplix-boot/auth";

const spring = createSpringAuthConfig({
  loginEndpoint: "/api/v1/auth/token/issue",
  refreshEndpoint: "/api/v1/auth/token/refresh",
  revokeEndpoint: "/api/v1/auth/token/revoke",
  userInfoEndpoint: "/api/v1/user/me",
});
```

### Integrate with `@simplix-react/auth`

```ts
import { createAuth, bearerScheme } from "@simplix-react/auth";
import { createSpringAuthConfig } from "@simplix-boot/auth";

const spring = createSpringAuthConfig();

const auth = createAuth({
  schemes: [bearerScheme({
    refresh: { refreshFn: spring.refreshFn },
  })],
});

// Login with Basic Auth
const tokenPair = await spring.loginFn("username", "password");

// Refresh token
const newTokenPair = await spring.refreshFn();

// Revoke session
await spring.revokeFn();

// Get user info
const user = await spring.userInfoFn(tokenPair.accessToken);
```

### Parse Token Response Directly

If you need to convert a raw Spring token response without the full config:

```ts
import { parseSpringTokenResponse } from "@simplix-boot/auth";

const tokenPair = parseSpringTokenResponse({
  accessToken: "eyJhbGci...",
  refreshToken: "dGhpcyBp...",
  accessTokenExpiry: "2026-02-20T01:00:00Z",
  refreshTokenExpiry: "2026-02-27T00:00:00Z",
});
// tokenPair.expiresAt === "2026-02-20T01:00:00Z"
```

## API Reference

### `createSpringAuthConfig(options?)`

Creates auth callback functions for Spring Security endpoints.

**Options (`SpringAuthOptions`):**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `loginEndpoint` | `string` | `"/api/v1/auth/token/issue"` | Basic Auth login endpoint |
| `refreshEndpoint` | `string` | `"/api/v1/auth/token/refresh"` | Token refresh endpoint |
| `revokeEndpoint` | `string` | `"/api/v1/auth/token/revoke"` | Token revocation endpoint |
| `userInfoEndpoint` | `string` | `"/api/v1/user/me"` | User info endpoint |
| `fetchFn` | `FetchFn` | `defaultFetch` | Custom fetch function |

**Returns:**

| Function | Signature | Description |
| --- | --- | --- |
| `loginFn` | `(username: string, password: string) => Promise<TokenPair>` | Login with Basic Auth |
| `refreshFn` | `() => Promise<TokenPair>` | Refresh access token |
| `revokeFn` | `() => Promise<void>` | Revoke current session |
| `userInfoFn` | `(token: string) => Promise<SpringUser>` | Fetch authenticated user info |

### `parseSpringTokenResponse(response)`

Converts a raw `SpringTokenResponse` into a `TokenPair`.

**Mapping:**

| Spring Field | TokenPair Field |
| --- | --- |
| `accessToken` | `accessToken` |
| `refreshToken` | `refreshToken` |
| `accessTokenExpiry` | `expiresAt` |
| `refreshTokenExpiry` | `refreshTokenExpiresAt` |

### Types

#### `SpringTokenResponse`

```ts
interface SpringTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;   // ISO 8601
  refreshTokenExpiry: string;  // ISO 8601
}
```

#### `SpringUser`

```ts
interface SpringUser {
  userId: string;
  username: string;
  displayName?: string;
  email?: string;
  roles: Array<string | { roleCode: string; roleName: string }>;
  isSuperAdmin?: boolean | string;
}
```

#### `SpringAuthOptions`

See [createSpringAuthConfig options](#createspringauthconfigoptions) above.

## Error Handling

All functions (`loginFn`, `refreshFn`, `revokeFn`, `userInfoFn`) propagate errors thrown by `fetchFn` directly. There is no built-in retry or error transformation logic.

- **Login failure (401):** `loginFn` throws, so handle it with `try/catch` at the call site.
- **Token refresh failure:** When used with `bearerScheme`, the `onRefreshFailure` callback on `createAuth` is invoked.
- **Custom error handling:** Pass a custom fetch function with error interceptors via the `fetchFn` option.

> **Next Step:** Use `@simplix-boot/access` to set up Spring Security authorization.
> See [@simplix-boot/access](../access/README.md).
