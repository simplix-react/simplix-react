# simplix-boot

Extension for SimpliX, a Spring Boot-based backend framework by SimpleCORE Inc. Provides adapter packages that implement simplix-react core interfaces for SimpliX's Spring Security APIs.

> **What is an Extension?** Core packages (`packages/`) define environment-agnostic abstract interfaces. Extensions (`extensions/`) provide concrete implementations for specific backend platforms, keeping consumer code portable. See [extensions/README.md](../README.md) for details.

## Packages

| Package | Description |
| --- | --- |
| [@simplix-boot/auth](./packages/auth/) | Spring Security authentication adapter for `@simplix-react/auth` |
| [@simplix-boot/access](./packages/access/) | Spring Security authorization adapter for `@simplix-react/access` |

## How It Works

SimpliX backends expose Spring Security-based token and permission endpoints with their own response formats. This extension translates those formats into the abstract interfaces defined by `@simplix-react/auth` and `@simplix-react/access`, keeping your React application portable.

```
Spring Security API          simplix-boot           simplix-react

POST /auth/token/issue  -->  @simplix-boot/auth  -->  TokenPair
POST /auth/token/refresh                              AuthConfig
GET  /user/me                                         SpringUser

GET  /user/me/permissions -> @simplix-boot/access --> AccessAdapter
                                                      AccessRule[]
```

## Quick Start

### Authentication

```ts
import { createAuth, bearerScheme } from "@simplix-react/auth";
import { createSpringAuthConfig } from "@simplix-boot/auth";

const spring = createSpringAuthConfig({
  loginEndpoint: "/api/v1/auth/token/issue",
  refreshEndpoint: "/api/v1/auth/token/refresh",
});

const auth = createAuth({
  schemes: [bearerScheme({ refresh: { refreshFn: spring.refreshFn } })],
});

// Login
const tokenPair = await spring.loginFn("username", "password");
```

### Authorization

```ts
import { createAccess } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-boot/access";

const adapter = createSpringAccessAdapter({
  permissionsEndpoint: "/api/v1/user/me/permissions",
  fetchFn: auth.fetchFn,
});

const access = createAccess({ adapter });
```

### Full Integration

A production pattern that wires Auth and Access together. By passing `auth.fetchFn` to the access adapter, auth tokens are automatically included in permission requests.

```ts
// shared/config/auth.ts
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
import { createSpringAuthConfig } from "@simplix-boot/auth";

const store = localStorageStore("myapp:");

let springConfig: ReturnType<typeof createSpringAuthConfig>;

export const auth = createAuth({
  schemes: [
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: {
        refreshFn: () => springConfig.refreshFn(),
        refreshBeforeExpiry: 60,
      },
    }),
  ],
  store,
  onRefreshFailure: () => {
    window.location.href = "/login";
  },
});

springConfig = createSpringAuthConfig({ fetchFn: auth.fetchFn });
export const spring = springConfig;
```

```ts
// shared/config/access.ts
import { createAccessPolicy } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-boot/access";
import { auth } from "./auth";

const adapter = createSpringAccessAdapter({
  fetchFn: auth.fetchFn,
});

export const accessPolicy = createAccessPolicy({
  adapter,
  isSuperAdmin: (user) => user.isSuperAdmin === true,
  persist: { key: "myapp-access" },
});
```

> **Why the lazy reference?** `createAuth` and `createSpringAuthConfig` reference each other's `fetchFn`. Declaring `springConfig` as a lazy reference avoids circular initialization.

## Expected SimpliX Endpoints

### Token Endpoints

| Method | Default Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/token/issue` | Basic Auth login, returns token pair |
| POST | `/api/v1/auth/token/refresh` | Refresh access token |
| POST | `/api/v1/auth/token/revoke` | Revoke current session |
| GET | `/api/v1/user/me` | Authenticated user info |

### Permission Endpoints

| Method | Default Path | Description |
| --- | --- | --- |
| GET | `/api/v1/user/me/permissions` | Authenticated user permissions |
| GET | `/api/v1/public/user/permissions` | Public (unauthenticated) permissions |

All endpoint paths are configurable via options.

## Development

```bash
# Build
pnpm --filter "@simplix-boot/*" build

# Test
pnpm --filter "@simplix-boot/*" test

# Typecheck
pnpm --filter "@simplix-boot/*" typecheck
```

## Error Handling

Both packages use `fetchFn` (defaults to `defaultFetch`) for HTTP requests. There is no built-in retry or error transformation logic — errors thrown by `fetchFn` propagate directly to the caller.

- **401 Unauthorized:** When used with `bearerScheme`, the refresh logic automatically renews the token. If refresh fails, the `onRefreshFailure` callback is invoked.
- **Network errors / other HTTP errors:** Handle errors thrown by `fetchFn` with `try/catch` at the call site.
- **Custom error handling:** Pass a custom fetch function with error interceptors via the `fetchFn` option.

## Prerequisites

> This extension requires `@simplix-react/auth`, `@simplix-react/access`, and `@simplix-react/contract` as peer dependencies.
