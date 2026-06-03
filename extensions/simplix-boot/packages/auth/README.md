# @simplix-react-ext/simplix-boot-auth

Spring Security authentication for `simplix-boot`. Wires token issue/refresh/revoke, proactive auto-refresh, cross-tab sync, and the SimpliX Boot response envelope into ready-to-use fetch functions and auth clients.

## Installation

```bash
pnpm add @simplix-react-ext/simplix-boot-auth
```

> **Prerequisites:** Requires `@simplix-react/api`, `@simplix-react/auth`, `@simplix-react/contract`, `@simplix-react/i18n`, and `zod` (`^4.0.0`) as peer dependencies.

## Usage

### Create the Auth Client

`createBootAuth()` is the high-level factory. You call it once at startup; it builds a bearer-scheme auth instance, a token store, and several fetch functions tuned for SimpliX Boot endpoints:

```ts
import { createBootAuth } from "@simplix-react-ext/simplix-boot-auth";

const {
  auth,
  authClient,
  store,
  baseFetch,
  rawAuthFetch,
  bootMutator,
  getToken,
} = createBootAuth({
  basePath: "/api/v1",
  refreshBeforeExpiry: 60,
});

// Log in: returns a TokenPair (does not persist tokens itself)
const tokens = await authClient.loginFn("admin", "secret");
auth.set(tokens);

// Read the current access token
const token = getToken();
```

By default the client schedules background token refresh (`autoSchedule`), enables cross-tab logout/token sync (`crossTabSync`), and redirects to `/login` when a refresh fails. Override any of these through `BootAuthOptions`.

### Wire the Boot Mutator into Domain Packages

`bootMutator` is an auth-wrapped fetch that also unwraps the SimpliX Boot envelope, so generated Boot domain packages receive the plain `body`:

```ts
import { createBootAuth } from "@simplix-react-ext/simplix-boot-auth";

const { bootMutator } = createBootAuth();

// Pass bootMutator as the fetch function to a Boot domain contract.
// Each response is unwrapped from { type, message, body, ... } to its body.
const pets = await bootMutator<Pet[]>("/api/v1/pets", { method: "GET" });
```

### Wrap and Unwrap Envelopes

SimpliX Boot wraps every response in a `BootEnvelope`. Use `wrapEnvelope()` to produce one and `unwrapEnvelope()` to extract the `body`:

```ts
import { wrapEnvelope, unwrapEnvelope } from "@simplix-react-ext/simplix-boot-auth";

const wire = wrapEnvelope({ id: 1, name: "Rex" });
// { type: "SUCCESS", message: "OK", body: { id: 1, name: "Rex" }, timestamp, errorCode: null, errorDetail: null }

const body = unwrapEnvelope<{ id: number; name: string }>(wire);
// { id: 1, name: "Rex" }
```

### Validate Spring Page Responses

`pageOf()` extends the Spring `Page` schema with a typed `content` array for use in a contract:

```ts
import { z } from "zod";
import { pageOf } from "@simplix-react-ext/simplix-boot-auth";

const petSchema = z.object({ id: z.number(), name: z.string() });
const petPageSchema = pageOf(petSchema);

const page = petPageSchema.parse(response);
// page.content: { id: number; name: string }[]
// page.totalElements, page.totalPages, page.first, page.last, ...
```

### Mock Auth Endpoints

The `/mock` subpath provides `createAuthMock()`, which returns a `MockDomainConfig` of MSW handlers for token and user endpoints:

```ts
import { createAuthMock } from "@simplix-react-ext/simplix-boot-auth/mock";

const authMock = createAuthMock({
  basePath: "/api/v1",
  users: {
    admin: {
      user: {
        userId: "1",
        username: "admin",
        displayName: "Admin",
        email: "admin@example.com",
        roles: [{ roleCode: "ROLE_ADMIN", roleName: "Admin" }],
        isSuperAdmin: true,
      },
      permissions: {
        permissions: { Pet: ["list", "view"] },
        roles: [{ roleCode: "ROLE_ADMIN", roleName: "Admin" }],
        isSuperAdmin: true,
      },
      password: "admin",
    },
  },
});
```

## API Reference

### `createBootAuth(options?)`

Creates a SimpliX Boot auth setup: a bearer-scheme `AuthInstance`, a token store, an auth client, and Boot-aware fetch functions.

**Options (`BootAuthOptions`):**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storePrefix` | `string` | `"simplix:"` | Key prefix for the default `localStorage` token store |
| `store` | `TokenStore` | `localStorageStore(storePrefix)` | Custom token store |
| `basePath` | `string` | `"/api/v1"` | Base path for auth endpoints |
| `fetchFn` | `FetchFn` | `createBootHttpFetch(fetchOptions)` | Base fetch used for token requests |
| `fetchOptions` | `BootFetchOptions` | - | Options forwarded to the default `createBootHttpFetch` |
| `refreshBeforeExpiry` | `number` | `60` | Seconds before access-token expiry to trigger a proactive refresh |
| `onRefreshFailure` | `(error: Error) => void` | redirect to `/login` | Called when a refresh fails (after tokens are cleared) |
| `maxRetries` | `number` | - | Max retries forwarded to the auth config |
| `rawFetchOptions` | `{ baseUrl?: string }` | - | When set, builds `rawAuthFetch` for non-Boot specs (401 retry, no Boot error handling) |
| `autoSchedule` | `boolean` | `true` | Background token auto-refresh |
| `crossTabSync` | `boolean` | `true` | Cross-tab logout/token sync |

**Behavior:**

- The refresh flow POSTs to `${basePath}/auth/token/refresh` with an `X-Refresh-Token` header, using `baseFetch` directly (it does not pass through the auth wrapper).
- `onRefreshFailure` is wrapped so that stale tokens are cleared before the user callback runs, preventing an infinite refresh loop on page reload.
- When `rawFetchOptions` is omitted, `rawAuthFetch` falls back to `baseFetch`.
- When `crossTabSync` is enabled, an external logout in another tab clears this instance's tokens.

**Returns (`BootAuthResult`):**

| Field | Type | Description |
| --- | --- | --- |
| `auth` | `AuthInstance` | Auth instance from `@simplix-react/auth` |
| `authClient` | `BootAuthClient` | Login / refresh / revoke / user-info functions |
| `store` | `TokenStore` | The resolved token store |
| `baseFetch` | `FetchFn` | Base fetch with Boot error conversion (no envelope unwrap) |
| `rawAuthFetch` | `FetchFn` | Auth-wrapped fetch without Boot error handling (401 retry + proactive refresh) |
| `bootMutator` | `FetchFn` | Auth-wrapped fetch with Boot envelope unwrapping (for Boot domain packages) |
| `getToken` | `() => string \| null` | Reads the current access token from the store |

### `createBootHttpFetch(options?)`

Creates a `FetchFn` that performs HTTP requests and converts non-OK responses into an `ApiResponseError`. It does **not** unwrap the envelope.

**Options (`BootFetchOptions`):**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | - | Base URL prepended to request paths |
| `getToken` | `() => string \| null` | - | Supplies the bearer token for the `Authorization` header |

**Behavior:**

- On an error response, the body is converted with `bootResponseAdapter.toError(body, status)` and thrown.

### `bootResponseAdapter`

An adapter object with a single `toError(raw, status)` method that maps a Boot error response into an `ApiResponseError`.

**Behavior:**

- When `raw` is an object containing a `type` field, it is treated as a `BootEnvelope` and its `type`, `message`, `timestamp`, `errorCode`, and `errorDetail` are carried onto the error.
- Otherwise a generic `ApiResponseError(status, "ERROR", "HTTP {status}", <now>)` is produced.

### `wrapEnvelope(body)`

Wraps a value into a success `BootEnvelope`.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `body` | `T` | The payload to wrap |

Returns a `BootEnvelope<T>` with `type: "SUCCESS"`, `message: "OK"`, the current `timestamp`, and `errorCode`/`errorDetail` set to `null`.

### `unwrapEnvelope(wire)`

Extracts the `body` from a `BootEnvelope`.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `wire` | `unknown` | A `BootEnvelope` or a raw value |

**Behavior:**

- If `wire` is a Boot envelope (an object with `type` and `body`) and its `type` is not `"SUCCESS"`, an `ApiResponseError` is thrown with status `400`.
- If `wire` is a `"SUCCESS"` envelope, its `body` is returned.
- If `wire` is not an envelope, it is returned unchanged.

### `envelopeSchema(bodySchema)`

Builds a Zod schema for a `BootEnvelope` with the given `bodySchema` for the `body` field. The resulting schema validates `type`, `message`, `body`, `timestamp`, and the optional/nullable `errorCode` and `errorDetail`.

```ts
import { z } from "zod";
import { envelopeSchema } from "@simplix-react-ext/simplix-boot-auth";

const petEnvelopeSchema = envelopeSchema(z.object({ id: z.number() }));
```

### `pageOf(itemSchema)`

Extends `springPageSchema` with a `content: itemSchema[]` field, producing a schema for a Spring `Page` of the given item type.

**Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `itemSchema` | `z.ZodType` | Schema for a single page item |

### `springPageSchema`

A Zod schema for Spring `Page` pagination metadata (`totalPages`, `totalElements`, `first`, `last`, `size`, `number`, `numberOfElements`, `empty`, and the optional `sort` / `pageable` objects). It does not include `content`; use `pageOf()` to add it.

### `createAuthMock(options)`

Available from the `@simplix-react-ext/simplix-boot-auth/mock` subpath. Returns a `MockDomainConfig` of MSW handlers covering token issue/refresh/revoke, `user/me`, `user/me/permissions`, and public permissions.

**Options (`AuthMockOptions`):**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `basePath` | `string` | `"/api/v1"` | Base path for the mocked endpoints |
| `users` | `Record<string, MockUserProfile>` | - | Username-keyed mock user profiles |

**Behavior:**

- `POST ${basePath}/auth/token/issue` validates the `Authorization: Basic` header against the matching user's `password` and returns a token response on success, otherwise `401`.
- Authenticated handlers (`user/me`, `user/me/permissions`) read the username from the `Bearer mock-access-<username>-...` token and wrap responses in a Boot envelope.
- `GET ${basePath}/public/user/permissions` returns an empty permissions envelope.

### Schemas

Re-exported from `schemas.js`. Each is a Zod schema you can compose into a contract.

| Export | Shape |
| --- | --- |
| `loginInputSchema` | `{ username: string; password: string }` |
| `tokenResponseSchema` | `{ accessToken; refreshToken; accessTokenExpiry; refreshTokenExpiry }` (all strings) |
| `roleSchema` | `string \| { roleCode: string; roleName: string }` |
| `userProfileSchema` | `{ userId; username; displayName; email; roles: roleSchema[]; isSuperAdmin }` |
| `permissionsSchema` | `{ permissions: Record<string, string[]>; roles: roleSchema[]; isSuperAdmin }` |

## Types

### `BootAuthOptions`

See [createBootAuth options](#createbootauthoptions) above.

### `BootAuthClient`

```ts
interface BootAuthClient {
  loginFn: (username: string, password: string) => Promise<TokenPair>;
  refreshFn: () => Promise<TokenPair>;
  revokeFn: () => Promise<void>;
  userInfoFn: () => Promise<unknown>;
}
```

`loginFn` POSTs Basic-auth credentials to `${basePath}/auth/token/issue` and returns the parsed `TokenPair`. It does not persist tokens — call `auth.set(...)` to store them. `userInfoFn` fetches `${basePath}/user/me` and returns the unwrapped envelope body.

### `BootAuthResult`

See [createBootAuth returns](#createbootauthoptions) above.

### `BootFetchOptions`

```ts
interface BootFetchOptions {
  baseUrl?: string;
  getToken?: () => string | null;
}
```

### `BootEnvelope`

```ts
interface BootEnvelope<T = unknown> {
  type: string;
  message: string;
  body: T;
  timestamp: string;
  errorCode?: string | null;
  errorDetail?: ErrorDetail | null;
}
```

### `SpringPage`

```ts
type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
};
```

### `ErrorDetail`

```ts
type ErrorDetail =
  | Array<{ field: string; message: string }>
  | Record<string, unknown>;
```

## Error Handling

This package surfaces backend failures as a single `ApiResponseError`.

`ApiResponseError` extends `Error` and carries the structured fields of a Boot error response:

| Field | Type | Description |
| --- | --- | --- |
| `status` | `number` | HTTP status code |
| `type` | `string` | Boot response type (for example `"ERROR"`) |
| `errorMessage` | `string` | Human-readable message (also the `Error.message`) |
| `timestamp` | `string` | ISO timestamp from the response |
| `errorCode` | `string \| undefined` | Optional application error code |
| `errorDetail` | `ErrorDetail \| undefined` | Optional field-level details or a free-form record |

Errors surface from two paths:

- **Transport errors:** `createBootHttpFetch()` calls `bootResponseAdapter.toError(body, status)` on any non-OK response and throws the resulting `ApiResponseError`. `baseFetch` (and therefore `createBootAuth`'s token calls) uses this fetch.
- **Envelope errors:** `unwrapEnvelope()` throws an `ApiResponseError` (status `400`) when a response envelope's `type` is not `"SUCCESS"`. `bootMutator` unwraps every response, so a non-success envelope propagates as an `ApiResponseError` to the caller.

Catch `ApiResponseError` at the call site to read `status`, `errorCode`, and `errorDetail` for user-facing messaging.

```ts
import { ApiResponseError } from "@simplix-react-ext/simplix-boot-auth";

try {
  await bootMutator("/api/v1/pets", { method: "GET" });
} catch (error) {
  if (error instanceof ApiResponseError) {
    console.error(error.status, error.errorCode, error.errorDetail);
  }
}
```

## Related

- [simplix-boot extension overview](../../README.md)
- [@simplix-react-ext/simplix-boot-access](../access/README.md)
