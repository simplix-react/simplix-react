# @simplix-react/auth

Authentication middleware for `@simplix-react/contract` with a strategy pattern. Plug in one or more auth schemes, pick a token store, and get an authenticated `fetchFn` you can pass straight to `defineApi`.

## Installation

```bash
pnpm add @simplix-react/auth
```

### Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `@simplix-react/contract` | workspace | Yes |
| `react` | >= 18.0.0 | Optional |

Install React if you use the React bindings (`@simplix-react/auth/react`):

```bash
pnpm add react
```

## Quick Example

```ts
import { defineApi } from "@simplix-react/contract";
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
import { z } from "zod";

// 1. Create a token store
const store = localStorageStore("myapp:");

// 2. Create an auth instance
const auth = createAuth({
  schemes: [
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: {
        refreshFn: async () => {
          const res = await fetch("/auth/refresh", { method: "POST" });
          return res.json(); // { accessToken, refreshToken?, expiresIn? }
        },
      },
    }),
  ],
  store,
  onRefreshFailure: () => (location.href = "/login"),
});

// 3. Pass the authenticated fetchFn to defineApi
const api = defineApi(
  {
    domain: "project",
    basePath: "/api/v1",
    entities: {
      task: {
        path: "/tasks",
        schema: z.object({ id: z.string(), title: z.string() }),
        createSchema: z.object({ title: z.string() }),
        updateSchema: z.object({ title: z.string().optional() }),
      },
    },
  },
  { fetchFn: auth.fetchFn },
);

// Every request now carries Authorization: Bearer <token>
const tasks = await api.client.task.list();
```

## API Overview

| Export | Kind | Description |
| --- | --- | --- |
| `createAuth` | Function | Creates a reactive auth instance with state management |
| `createAuthFetch` | Function | Creates an authenticated `FetchFn` with 401 retry and refresh |
| `bearerScheme` | Function | Bearer token auth scheme |
| `apiKeyScheme` | Function | API key auth scheme (header or query) |
| `oauth2Scheme` | Function | OAuth2 `refresh_token` grant scheme |
| `customScheme` | Function | User-defined auth scheme from callbacks |
| `composeSchemes` | Function | Merges multiple schemes into one |
| `memoryStore` | Function | In-memory token store |
| `localStorageStore` | Function | `localStorage`-backed token store |
| `sessionStorageStore` | Function | `sessionStorage`-backed token store |
| `AuthError` | Class | Typed error for auth failures |

### Type Exports

| Export | Description |
| --- | --- |
| `AuthScheme` | Contract interface for authentication strategies |
| `TokenStore` | Key-value store abstraction for tokens |
| `TokenPair` | Access/refresh token pair with optional expiry |
| `AuthConfig` | Configuration for `createAuth` |
| `AuthInstance` | Reactive auth instance returned by `createAuth` |
| `BearerSchemeOptions` | Options for `bearerScheme` |
| `ApiKeySchemeOptions` | Options for `apiKeyScheme` |
| `OAuth2SchemeOptions` | Options for `oauth2Scheme` |
| `CustomSchemeOptions` | Options for `customScheme` |
| `AuthErrorCode` | Discriminated union of auth error codes |

## Key Concepts

### createAuth

Creates a reactive `AuthInstance` that manages auth state, exposes an authenticated `fetchFn`, and supports subscriptions for state change notifications.

```ts
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:");
const auth = createAuth({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
  store,
  onRefreshFailure: (error) => console.error("Refresh failed:", error),
  maxRetries: 1, // retry count after 401 (default: 1)
});

auth.isAuthenticated();            // true if any scheme has valid credentials
auth.getAccessToken();             // current access token or null
auth.setTokens({ accessToken: "abc", refreshToken: "xyz", expiresIn: 3600 });
auth.clear();                      // clears all auth state

const unsub = auth.subscribe(() => {
  console.log("Auth changed:", auth.isAuthenticated());
});
```

### createAuthFetch

Creates an authenticated `FetchFn` without the full reactive wrapper. Useful when you only need request interception without React integration.

```ts
import { createAuthFetch, bearerScheme, memoryStore } from "@simplix-react/auth";

const store = memoryStore();
const fetchFn = createAuthFetch({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
  maxRetries: 2,
  onRefreshFailure: () => redirectToLogin(),
});

const api = defineApi(config, { fetchFn });
```

The fetch wrapper:

1. Merges auth headers from all configured schemes
2. On 401 response, triggers single-flight token refresh (deduplicates concurrent refresh calls)
3. Retries the original request with fresh credentials
4. Calls `onRefreshFailure` if all refresh attempts fail

## Schemes

### bearerScheme

Attaches `Authorization: Bearer <token>` to each request. Supports proactive token refresh before expiry.

```ts
import { bearerScheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:");

const scheme = bearerScheme({
  store,
  // Static token or getter function
  token: () => store.get("access_token"),
  // Optional: auto-refresh before expiry
  refresh: {
    refreshFn: async () => {
      const res = await fetch("/auth/refresh", { method: "POST" });
      return res.json(); // must return TokenPair
    },
    refreshBeforeExpiry: 60, // seconds before expiry to trigger proactive refresh
  },
});
```

### apiKeyScheme

Attaches an API key as a header or query parameter.

```ts
import { apiKeyScheme } from "@simplix-react/auth";

// As a header
const headerScheme = apiKeyScheme({
  in: "header",
  name: "X-API-Key",
  key: "sk-abc123",
});

// As a query parameter
const queryScheme = apiKeyScheme({
  in: "query",
  name: "api_key",
  key: () => getApiKey(), // static string or getter function
});
```

### oauth2Scheme

Implements the OAuth2 `refresh_token` grant. Stores tokens automatically and refreshes via the standard token endpoint.

```ts
import { oauth2Scheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:");

const scheme = oauth2Scheme({
  store,
  tokenEndpoint: "https://auth.example.com/oauth/token",
  clientId: "my-client-id",
  clientSecret: "my-client-secret", // omit for public clients
  scopes: ["read", "write"],
  tokenEndpointHeaders: { "X-Custom": "value" },
  tokenEndpointBody: { audience: "https://api.example.com" },
});
```

### customScheme

Creates a scheme from user-defined callbacks. Use this for non-standard auth flows (JWE, HMAC signing, form-based auth).

```ts
import { customScheme } from "@simplix-react/auth";

const jweAuth = customScheme({
  name: "jwe",
  getHeaders: async () => ({
    Authorization: `Bearer ${await decryptJwe(getStoredJwe())}`,
  }),
  refresh: async () => {
    const res = await fetch("/auth/token", { method: "POST" });
    storeTokens(await res.json());
  },
  isAuthenticated: () => !!getStoredJwe(),
  clear: () => clearStorage(),
});
```

### composeSchemes

Merges multiple schemes into a single `AuthScheme`. Headers from all schemes are merged (later schemes win on conflict). Refresh uses the first scheme that supports it.

```ts
import { composeSchemes, bearerScheme, apiKeyScheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:");

const composed = composeSchemes(
  bearerScheme({ store, token: () => store.get("access_token") }),
  apiKeyScheme({ in: "header", name: "X-API-Key", key: "sk-abc" }),
);

// composed.name → "bearer+api-key"
```

## Token Stores

### memoryStore

In-memory token storage backed by a `Map`. Tokens are lost when the process exits. Suitable for testing and short-lived sessions.

```ts
import { memoryStore } from "@simplix-react/auth";

const store = memoryStore();
```

### localStorageStore

`localStorage`-backed storage. All keys are prefixed to avoid collisions. Tokens persist across browser sessions.

```ts
import { localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:"); // prefix defaults to "auth:"
// localStorage key: "myapp:access_token"
```

### sessionStorageStore

`sessionStorage`-backed storage. Same API as `localStorageStore`, but tokens only persist for the current browser tab.

```ts
import { sessionStorageStore } from "@simplix-react/auth";

const store = sessionStorageStore("myapp:");
```

## React Bindings

Import from `@simplix-react/auth/react`. Requires `react >= 18.0.0` as a peer dependency.

### AuthProvider

Provides an `AuthInstance` to the React component tree. Must wrap any component that uses `useAuth` or `useAuthFetch`.

```tsx
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
import { AuthProvider } from "@simplix-react/auth/react";

const store = localStorageStore("myapp:");
const auth = createAuth({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
  store,
});

function App() {
  return (
    <AuthProvider auth={auth}>
      <MyApp />
    </AuthProvider>
  );
}
```

### useAuth

React hook for managing authentication state. Re-renders when `isAuthenticated` changes (powered by `useSyncExternalStore`).

```tsx
import { useAuth } from "@simplix-react/auth/react";

function UserMenu() {
  const { isAuthenticated, login, logout, getAccessToken } = useAuth();

  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }

  async function handleLogin() {
    const res = await fetch("/auth/login", { method: "POST", body: "..." });
    const tokens = await res.json();
    login(tokens); // { accessToken, refreshToken?, expiresIn? }
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| `isAuthenticated` | `boolean` | Whether any scheme has valid credentials |
| `login` | `(tokens: TokenPair) => void` | Stores tokens and notifies subscribers |
| `logout` | `() => void` | Clears all auth state |
| `getAccessToken` | `() => string \| null` | Returns the current access token |

### useAuthFetch

Returns the authenticated `FetchFn` from the nearest `AuthProvider`. Useful for ad-hoc requests outside the standard hooks.

```tsx
import { useAuthFetch } from "@simplix-react/auth/react";

function FileUploader() {
  const fetchFn = useAuthFetch();

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    await fetchFn("/api/upload", { method: "POST", body: formData });
  }

  return <input type="file" onChange={(e) => upload(e.target.files![0])} />;
}
```

## Advanced Examples

### Composite Auth (Bearer + API Key)

Send both a Bearer token and an API key on every request:

```ts
import {
  createAuth,
  composeSchemes,
  bearerScheme,
  apiKeyScheme,
  localStorageStore,
} from "@simplix-react/auth";
import { defineApi } from "@simplix-react/contract";

const store = localStorageStore("myapp:");

const auth = createAuth({
  schemes: [
    composeSchemes(
      bearerScheme({
        store,
        token: () => store.get("access_token"),
        refresh: { refreshFn: myRefreshFn },
      }),
      apiKeyScheme({ in: "header", name: "X-API-Key", key: "sk-abc123" }),
    ),
  ],
  store,
});

const api = defineApi(config, { fetchFn: auth.fetchFn });
// Requests carry both Authorization and X-API-Key headers
```

### OAuth2 Flow

Complete OAuth2 setup with automatic token refresh:

```ts
import { createAuth, oauth2Scheme, localStorageStore } from "@simplix-react/auth";
import { defineApi } from "@simplix-react/contract";

const store = localStorageStore("oauth:");

const auth = createAuth({
  schemes: [
    oauth2Scheme({
      store,
      tokenEndpoint: "https://auth.example.com/oauth/token",
      clientId: "my-spa-client",
      scopes: ["openid", "profile", "api"],
    }),
  ],
  store,
  onRefreshFailure: () => {
    auth.clear();
    location.href = "/login";
  },
});

// After the OAuth callback, store the initial tokens:
auth.setTokens({
  accessToken: tokenResponse.access_token,
  refreshToken: tokenResponse.refresh_token,
  expiresIn: tokenResponse.expires_in,
});

// All subsequent requests auto-refresh via the token endpoint
const api = defineApi(config, { fetchFn: auth.fetchFn });
```

### Custom JWE Scheme

Implement encrypted token authentication with a custom scheme:

```ts
import { createAuth, customScheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("jwe:");

const auth = createAuth({
  schemes: [
    customScheme({
      name: "jwe",
      getHeaders: async () => {
        const jwe = store.get("access_token");
        if (!jwe) return {};
        const decrypted = await decryptJwe(jwe, encryptionKey);
        return { Authorization: `Bearer ${decrypted}` };
      },
      refresh: async () => {
        const res = await fetch("/auth/jwe/refresh", {
          method: "POST",
          body: JSON.stringify({ token: store.get("refresh_token") }),
        });
        const { accessToken, refreshToken } = await res.json();
        store.set("access_token", accessToken);
        store.set("refresh_token", refreshToken);
      },
      isAuthenticated: () => store.get("access_token") !== null,
      clear: () => store.clear(),
    }),
  ],
  store,
});
```

## Error Handling

All auth errors throw `AuthError` with a typed `code` for programmatic handling:

```ts
import { AuthError } from "@simplix-react/auth";

try {
  await auth.fetchFn("/api/protected");
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case "TOKEN_EXPIRED":
        // Token has expired
        break;
      case "REFRESH_FAILED":
        // All refresh attempts failed
        redirectToLogin();
        break;
      case "UNAUTHENTICATED":
        // No valid credentials
        break;
      case "SCHEME_ERROR":
        // Scheme-level failure
        break;
    }
  }
}
```

**Error Codes:**

| Code | Description |
| --- | --- |
| `TOKEN_EXPIRED` | Token has expired |
| `REFRESH_FAILED` | All token refresh attempts failed |
| `UNAUTHENTICATED` | No valid credentials available |
| `SCHEME_ERROR` | Scheme-level failure |

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/form` | TanStack Form hooks derived from contracts |

---

Next Step → [`@simplix-react/react`](../react/README.md)
