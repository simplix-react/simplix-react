# simplix-boot

Extension for SimpliX, a Spring Boot-based backend framework by SimpleCORE Inc. Provides adapter packages that implement simplix-react core interfaces for SimpliX's Spring Security APIs.

> **What is an Extension?** Core packages (`packages/`) define environment-agnostic abstract interfaces. Extensions (`extensions/`) provide concrete implementations for specific backend platforms, keeping consumer code portable. See [extensions/README.md](../README.md) for details.

## Packages

| Package | Description |
| --- | --- |
| [@simplix-react-ext/simplix-boot-access](./packages/access/) | Spring Security authorization adapter for `@simplix-react/access` |
| [@simplix-react-ext/simplix-boot-auth](./packages/auth/) | Spring Security authentication contract (token, user profile, permissions) |

## How It Works

SimpliX backends expose Spring Security-based token and permission endpoints with their own response formats. This extension translates those formats into the abstract interfaces defined by `@simplix-react/access`, keeping your React application portable.

```
Spring Security API          simplix-boot           simplix-react

POST /auth/token/issue    -> @simplix-react-ext/simplix-boot-auth   --> AuthApi contract
GET  /user/me             -> @simplix-react-ext/simplix-boot-auth   --> AuthApi contract
GET  /user/me/permissions -> @simplix-react-ext/simplix-boot-access --> AccessAdapter
```

## Quick Start

### Authentication

```ts
import { createAuthApi } from "@simplix-react-ext/simplix-boot-auth";

// Default basePath: "/api/v1"
const authApi = createAuthApi();

// Custom basePath
const authApi = createAuthApi({ basePath: "/api/v2" });
```

For mock setup:

```ts
import { createAuthMock } from "@simplix-react-ext/simplix-boot-auth/mock";

const authMock = createAuthMock({
  authApi,
  users: {
    admin: {
      user: { userId: "1", username: "admin", displayName: "Admin", email: "admin@example.com", roles: [], isSuperAdmin: true },
      permissions: { permissions: {}, roles: [], isSuperAdmin: true },
      password: "admin",
    },
  },
});
```

### Authorization

```ts
import { createAccess } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-react-ext/simplix-boot-access";

const adapter = createSpringAccessAdapter({
  permissionsEndpoint: "/api/v1/user/me/permissions",
  fetchFn: auth.fetchFn,
});

const access = createAccess({ adapter });
```

### Full Integration

A production pattern that wires Auth and Access together. By passing `auth.fetchFn` to the access adapter, auth tokens are automatically included in permission requests.

```ts
// shared/config/access.ts
import { createAccessPolicy } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-react-ext/simplix-boot-access";
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

## Expected SimpliX Endpoints

### Authentication Endpoints

| Method | Default Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/token/issue` | Issue access/refresh tokens (Basic Auth) |
| POST | `/api/v1/auth/token/refresh` | Refresh access token |
| POST | `/api/v1/auth/token/revoke` | Revoke current token |
| GET | `/api/v1/user/me` | Get current user profile |

### Permission Endpoints

| Method | Default Path | Description |
| --- | --- | --- |
| GET | `/api/v1/user/me/permissions` | Authenticated user permissions |
| GET | `/api/v1/public/user/permissions` | Public (unauthenticated) permissions |

All endpoint paths are configurable via options.

## Development

```bash
# Build
pnpm --filter "@simplix-react-ext/simplix-boot-*" build

# Test
pnpm --filter "@simplix-react-ext/simplix-boot-*" test

# Typecheck
pnpm --filter "@simplix-react-ext/simplix-boot-*" typecheck
```

## Error Handling

This package uses `fetchFn` (defaults to `defaultFetch`) for HTTP requests. There is no built-in retry or error transformation logic — errors thrown by `fetchFn` propagate directly to the caller.

- **Network errors / other HTTP errors:** Handle errors thrown by `fetchFn` with `try/catch` at the call site.
- **Custom error handling:** Pass a custom fetch function with error interceptors via the `fetchFn` option.

## Prerequisites

> This extension requires `@simplix-react/access` and `@simplix-react/contract` as peer dependencies.
