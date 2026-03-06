# How to Use the Boot Extension

> Set up Spring Boot authentication, authorization, and CLI code generation using the simplix-boot extension packages.

## Before You Begin

- You have a simplix-react project scaffolded with `simplix init`
- Your backend is a SimpliX (Spring Boot) server with Spring Security endpoints
- You understand `@simplix-react/auth` and `@simplix-react/access` core concepts
- Install the extension packages:

```bash
pnpm add @simplix-react-ext/simplix-boot-auth @simplix-react-ext/simplix-boot-access
```

For CLI code generation support:

```bash
pnpm add -D @simplix-react-ext/simplix-boot-cli-plugin
```

For Boot-specific utilities:

```bash
pnpm add @simplix-react-ext/simplix-boot-utils
```

## Solution

### Setting Up Boot Authentication

`createBootAuth()` is a high-level factory that wires up Bearer token authentication with automatic refresh, cross-tab sync, and Boot error handling in a single call.

```ts
import { createBootAuth } from "@simplix-react-ext/simplix-boot-auth";

const { auth, authClient, store, bootMutator, rawAuthFetch, getToken } =
  createBootAuth({
    basePath: "/api/v1",
    storePrefix: "myapp:",
    refreshBeforeExpiry: 60,
    onRefreshFailure: (error) => {
      window.location.href = "/login";
    },
  });
```

What this sets up automatically:

- Bearer token scheme with `localStorageStore` (prefix configurable via `storePrefix`)
- Proactive token refresh 60 seconds before expiry (configurable via `refreshBeforeExpiry`)
- Background auto-refresh scheduling (disable with `autoSchedule: false`)
- Cross-tab logout and token sync via `BroadcastChannel` (disable with `crossTabSync: false`)
- Boot envelope error conversion to `ApiResponseError`
- Single-flight refresh deduplication (concurrent 401s share one refresh call)

#### `BootAuthOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storePrefix` | `string` | `"simplix:"` | Key prefix for `localStorageStore` |
| `store` | `TokenStore` | `localStorageStore(storePrefix)` | Custom token store (overrides `storePrefix`) |
| `basePath` | `string` | `"/api/v1"` | Base path for auth endpoints |
| `fetchFn` | `FetchFn` | `createBootHttpFetch()` | Custom base fetch function |
| `fetchOptions` | `BootFetchOptions` | - | Options for the default `createBootHttpFetch` |
| `refreshBeforeExpiry` | `number` | `60` | Seconds before expiry to proactively refresh |
| `onRefreshFailure` | `(error: Error) => void` | Redirect to `/login` | Callback when token refresh fails |
| `maxRetries` | `number` | - | Max 401 retry attempts |
| `rawFetchOptions` | `{ baseUrl?: string }` | - | Options for `rawAuthFetch` (non-Boot specs) |
| `autoSchedule` | `boolean` | `true` | Enable background token auto-refresh |
| `crossTabSync` | `boolean` | `true` | Enable cross-tab logout/token sync |

#### `BootAuthResult`

| Property | Type | Description |
| --- | --- | --- |
| `auth` | `AuthInstance` | Core auth instance (reactive state, `subscribe`, `clear`, etc.) |
| `authClient` | `BootAuthClient` | Login, refresh, revoke, and user info functions |
| `store` | `TokenStore` | Token store instance |
| `baseFetch` | `FetchFn` | Base fetch with Boot error conversion (no auth headers) |
| `rawAuthFetch` | `FetchFn` | Auth-wrapped fetch without Boot envelope handling |
| `bootMutator` | `FetchFn` | Auth-wrapped fetch with Boot envelope unwrapping |
| `getToken` | `() => string \| null` | Get current access token |

#### `BootAuthClient`

The `authClient` object provides direct access to Boot authentication operations:

```ts
// Login with username/password (Basic Auth)
const tokens = await authClient.loginFn("admin", "password");
// Returns: { accessToken, refreshToken, expiresAt, refreshTokenExpiresAt }

// Store tokens in auth
auth.setTokens(tokens);

// Refresh token manually
const newTokens = await authClient.refreshFn();

// Revoke current token
await authClient.revokeFn();

// Get current user profile (envelope auto-unwrapped)
const user = await authClient.userInfoFn();
```

#### Boot Token Endpoints

`createBootAuth` expects the following SimpliX endpoints:

| Method | Default Path | Description |
| --- | --- | --- |
| GET | `/api/v1/auth/token/issue` | Issue tokens (Basic Auth header) |
| GET | `/api/v1/auth/token/refresh` | Refresh token (`X-Refresh-Token` header) |
| POST | `/api/v1/auth/token/revoke` | Revoke current token |
| GET | `/api/v1/user/me` | Get current user profile |

All paths are relative to the configured `basePath`.

### Setting Up Boot Access Control

#### Using `createBootAccessPolicy()`

The simplest way to set up Boot authorization is `createBootAccessPolicy()`, which creates a complete `AccessPolicy` pre-wired for Spring Security:

```ts
import { createBootAccessPolicy } from "@simplix-react-ext/simplix-boot-access";

const accessPolicy = createBootAccessPolicy({
  fetchFn: auth.fetchFn,
  isSuperAdmin: (user) => user.isSuperAdmin === true,
  persist: { key: "myapp-access" },
});
```

This automatically:

- Fetches permissions from `/api/v1/user/me/permissions` (authenticated) or `/api/v1/public/user/permissions` (unauthenticated)
- Unwraps the Boot envelope if present
- Converts Spring Security permission format to CASL rules
- Adds a `{ action: "manage", subject: "all" }` rule for super admins

#### `BootAccessPolicyOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `fetchFn` | `OrvalMutator` | (required) | Fetch function (typically `auth.fetchFn`) |
| `adapterOptions` | `Omit<SpringAccessAdapterOptions, "fetchFn">` | - | Override adapter defaults |
| `isSuperAdmin` | `(user: AccessUser) => boolean` | `user.isSuperAdmin === true` | Super admin check function |
| `persist` | `AccessPersistConfig` | - | Persistence configuration |
| `enablePublicAccess` | `boolean` | `true` | Enable public (unauthenticated) permission fetching |

#### Using `createSpringAccessAdapter()` Directly

For more control, use the lower-level `createSpringAccessAdapter()` to create an `AccessAdapter` and compose it yourself:

```ts
import { createAccessPolicy } from "@simplix-react/access";
import { createSpringAccessAdapter } from "@simplix-react-ext/simplix-boot-access";

const adapter = createSpringAccessAdapter({
  permissionsEndpoint: "/api/v1/user/me/permissions",
  publicPermissionsEndpoint: "/api/v1/public/user/permissions",
  systemAdminRole: "ROLE_SYSTEM_ADMIN",
  fetchFn: auth.fetchFn,
});

const access = createAccessPolicy({ adapter });
```

#### `SpringAccessAdapterOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `permissionsEndpoint` | `string` | `"/api/v1/user/me/permissions"` | Authenticated permissions endpoint |
| `publicPermissionsEndpoint` | `string` | `"/api/v1/public/user/permissions"` | Public permissions endpoint |
| `systemAdminRole` | `string` | `"ROLE_SYSTEM_ADMIN"` | Role code that identifies a system admin |
| `fetchFn` | `OrvalMutator` | (required) | Custom fetch function |

#### Spring Security Permission Format

The adapter expects the following response shape from permission endpoints:

```ts
interface SpringPermissionsResponse {
  permissions: Record<string, string[]>;
  roles: Array<string | { roleCode: string; roleName: string }>;
  isSuperAdmin: boolean | string;
}
```

Example response:

```json
{
  "permissions": {
    "Pet": ["list", "view", "create"],
    "Order": ["list", "view"]
  },
  "roles": ["ROLE_USER", { "roleCode": "ROLE_ADMIN", "roleName": "Admin" }],
  "isSuperAdmin": false
}
```

This is converted to CASL rules:

```ts
[
  { action: "list", subject: "Pet" },
  { action: "view", subject: "Pet" },
  { action: "create", subject: "Pet" },
  { action: "list", subject: "Order" },
  { action: "view", subject: "Order" },
]
```

When `isSuperAdmin` is `true` (or string `"true"`), a `{ action: "manage", subject: "all" }` rule is prepended. The same applies when the `systemAdminRole` (default: `"ROLE_SYSTEM_ADMIN"`) is found in the user's roles.

#### Converting Permissions Directly

For cases where you already have a permissions response and just need CASL rules:

```ts
import { convertSpringPermissionsToCasl } from "@simplix-react-ext/simplix-boot-access";

const result = convertSpringPermissionsToCasl({
  permissions: { Pet: ["list", "view"], Order: ["list", "create"] },
  roles: ["ROLE_USER", { roleCode: "ROLE_ADMIN", roleName: "Admin" }],
  isSuperAdmin: false,
});

// result.rules: [{ action: "list", subject: "Pet" }, ...]
// result.roles: ["ROLE_USER", "ROLE_ADMIN"]
// result.isSuperAdmin: false
```

#### Checking Backoffice Access

A utility to verify backoffice access from CASL rules:

```ts
import { hasBackofficeAccess } from "@simplix-react-ext/simplix-boot-access";

hasBackofficeAccess(rules, true);              // true (super admin bypass)
hasBackofficeAccess(rules, false);             // checks for BACKOFFICE_ACCESS resource
hasBackofficeAccess(rules, false, "MY_PANEL"); // checks for custom resource
```

### Using the CLI Plugin

When `@simplix-react-ext/simplix-boot-cli-plugin` is installed, the CLI automatically loads it and registers a `simplix-boot` spec profile.

#### Spec Profile Registration

The plugin registers:

- **Naming strategy** (`simplixBootNaming`): Handles Boot-style OpenAPI conventions like tag format `scope.crud.EntityName`, auto-generated operation IDs, and CRUD path patterns (`/search`, `/create`, `/{id}`, `/{id}/edit`, `/batch`).
- **Response adapter** (`boot`): Configures Boot envelope handling for generated code, including `bootResponseAdapter` for error conversion and `wrapEnvelope` for mock responses.
- **Schema adapter** (`bootSchemaAdapter`): Unwraps Boot envelope schemas (strips `type`, `message`, `timestamp`, `errorCode`, `errorDetail` wrappers) so generated types reflect the actual `body` payload, not the envelope.

Use the `simplix-boot` profile when generating domain packages from a Boot API spec:

```bash
simplix openapi my-api-spec.json --profile simplix-boot
```

#### Boot Envelope Format

SimpliX APIs wrap all responses in a standard envelope:

```ts
interface BootEnvelope<T = unknown> {
  type: string;        // "SUCCESS" or error type
  message: string;     // Human-readable message
  body: T;             // Actual response payload
  timestamp: string;   // ISO 8601 timestamp
  errorCode?: string;  // Application-specific error code
  errorDetail?: ErrorDetail; // Validation errors or additional info
}
```

Success response example:

```json
{
  "type": "SUCCESS",
  "message": "OK",
  "body": { "id": 1, "name": "Buddy", "status": "available" },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "errorCode": null,
  "errorDetail": null
}
```

Error response example:

```json
{
  "type": "ERROR",
  "message": "Validation failed",
  "body": null,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "errorCode": "VALIDATION_ERROR",
  "errorDetail": [
    { "field": "name", "message": "must not be blank" }
  ]
}
```

The `bootMutator` from `createBootAuth()` automatically unwraps the envelope, returning only the `body` value. Error responses are converted to `ApiResponseError` instances before they reach your code.

#### Envelope Utilities

The auth package exports envelope helper functions:

```ts
import {
  wrapEnvelope,
  unwrapEnvelope,
  envelopeSchema,
} from "@simplix-react-ext/simplix-boot-auth";

// Wrap a value in a success envelope (useful for mocking)
const envelope = wrapEnvelope({ id: 1, name: "Buddy" });
// { type: "SUCCESS", message: "OK", body: { id: 1, name: "Buddy" }, ... }

// Unwrap an envelope to get the body
const body = unwrapEnvelope(envelope); // { id: 1, name: "Buddy" }

// Create a Zod schema for a typed envelope
const petEnvelopeSchema = envelopeSchema(petSchema);
```

### Error Handling with `ApiResponseError`

Boot error responses are automatically converted to `ApiResponseError` instances:

```ts
import { ApiResponseError } from "@simplix-react-ext/simplix-boot-auth";

try {
  await bootMutator("/api/v1/pets", {
    method: "POST",
    body: JSON.stringify({ name: "" }),
  });
} catch (error) {
  if (error instanceof ApiResponseError) {
    console.log(error.status);       // 400
    console.log(error.type);         // "ERROR"
    console.log(error.errorMessage); // "Validation failed"
    console.log(error.errorCode);    // "VALIDATION_ERROR"
    console.log(error.errorDetail);  // [{ field: "name", message: "must not be blank" }]
    console.log(error.timestamp);    // "2025-01-15T10:30:00.000Z"
  }
}
```

`ApiResponseError` extends `Error` with the following properties:

| Property | Type | Description |
| --- | --- | --- |
| `status` | `number` | HTTP status code |
| `type` | `string` | Response type from envelope |
| `errorMessage` | `string` | Human-readable error message |
| `timestamp` | `string` | ISO 8601 timestamp |
| `errorCode` | `string \| undefined` | Application-specific error code |
| `errorDetail` | `ErrorDetail \| undefined` | Validation errors or additional info |

`ErrorDetail` is typed as `Array<{ field: string; message: string }> | Record<string, unknown>`.

### Boot Utility Functions

#### `resolveBootEnum()`

Boot APIs may return enum values as plain strings or as `{ type, value, label }` objects. This utility normalizes both formats:

```ts
import { resolveBootEnum } from "@simplix-react-ext/simplix-boot-utils";

resolveBootEnum("ACTIVE");                           // "ACTIVE"
resolveBootEnum({ type: "Status", value: "ACTIVE", label: "Active" }); // "ACTIVE"
resolveBootEnum(null);                               // ""
```

### Setting Up Mocks

The auth package provides a mock entry point for development and testing:

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
        permissions: { Pet: ["list", "view", "create", "update", "delete"] },
        roles: [{ roleCode: "ROLE_ADMIN", roleName: "Admin" }],
        isSuperAdmin: true,
      },
      password: "admin",
    },
  },
});

// authMock is a MockDomainConfig with MSW handlers for all auth endpoints
```

This creates MSW handlers for token issue, token refresh, token revoke, user profile, and permission endpoints.

## Complete Integration Example

A production setup wiring Boot authentication and access control together:

```ts
// shared/config/auth.ts
import { createBootAuth } from "@simplix-react-ext/simplix-boot-auth";

export const { auth, authClient, store, bootMutator, getToken } =
  createBootAuth({
    basePath: "/api/v1",
    storePrefix: "myapp:",
    onRefreshFailure: () => {
      auth.clear();
      window.location.href = "/login";
    },
  });
```

```ts
// shared/config/access.ts
import { createBootAccessPolicy } from "@simplix-react-ext/simplix-boot-access";
import { auth } from "./auth";

export const accessPolicy = createBootAccessPolicy({
  fetchFn: auth.fetchFn,
  isSuperAdmin: (user) => user.isSuperAdmin === true,
  persist: { key: "myapp-access" },
});
```

```tsx
// app.tsx
import { AuthProvider } from "@simplix-react/auth/react";
import { AccessProvider } from "@simplix-react/access/react";
import { auth } from "./shared/config/auth";
import { accessPolicy } from "./shared/config/access";

function App() {
  return (
    <AuthProvider auth={auth}>
      <AccessProvider policy={accessPolicy}>
        <Router />
      </AccessProvider>
    </AuthProvider>
  );
}
```

```tsx
// pages/login.tsx
import { authClient, auth } from "../shared/config/auth";

function LoginPage() {
  async function handleLogin(username: string, password: string) {
    const tokens = await authClient.loginFn(username, password);
    auth.setTokens(tokens);
  }

  return <LoginForm onSubmit={handleLogin} />;
}
```

## Related

- [Extensions Architecture](../core-concepts/extensions.md) --- design decisions and how extensions work
- [Authentication Guide](./authentication.md) --- core auth setup (non-Boot)
- [Authentication Architecture](../core-concepts/authentication.md) --- core auth design
- [Mock Handlers](./mock-handlers.md) --- set up MSW handlers for development
