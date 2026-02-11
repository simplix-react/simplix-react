# How to Add Authentication

> Set up authenticated API requests using `@simplix-react/auth` with automatic token refresh, 401 retry, and React integration.

## Before You Begin

- You have a contract defined with `defineApi` from `@simplix-react/contract`
- You understand the `FetchFn` type signature: `<T>(path: string, options?: RequestInit) => Promise<T>`
- Install the auth package:

```bash
pnpm add @simplix-react/auth
```

## Solution

### Bearer Token Authentication

The most common setup: attach a Bearer token to every request and refresh it automatically when it expires.

```ts
import { defineApi } from "@simplix-react/contract";
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";
import { projectConfig } from "./contract";

const store = localStorageStore("myapp:");

const auth = createAuth({
  schemes: [
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: {
        refreshFn: async () => {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              refreshToken: store.get("refresh_token"),
            }),
          });
          if (!res.ok) throw new Error("Refresh failed");
          return res.json(); // must return { accessToken, refreshToken?, expiresIn? }
        },
        refreshBeforeExpiry: 60, // proactively refresh 60 seconds before expiry
      },
    }),
  ],
  store,
  onRefreshFailure: () => {
    auth.clear();
    window.location.href = "/login";
  },
});

const projectApi = defineApi(projectConfig, { fetchFn: auth.fetchFn });
```

What happens automatically:

- Every request receives an `Authorization: Bearer <token>` header
- 60 seconds before expiry, the token is proactively refreshed
- On a 401 response, a refresh is triggered and the request is retried once
- Concurrent 401s share a single refresh call (no thundering herd)
- If refresh fails, `onRefreshFailure` fires and the error is thrown

### API Key Authentication

For services that authenticate via a static API key in a header:

```ts
import { createAuth, apiKeyScheme } from "@simplix-react/auth";

const auth = createAuth({
  schemes: [
    apiKeyScheme({
      in: "header",
      name: "X-API-Key",
      key: "sk-your-api-key",
    }),
  ],
});

const api = defineApi(config, { fetchFn: auth.fetchFn });
// Every request includes: X-API-Key: sk-your-api-key
```

For API keys in query parameters:

```ts
apiKeyScheme({
  in: "query",
  name: "api_key",
  key: "sk-your-api-key",
});
// Appends ?api_key=sk-your-api-key to every request URL
```

### OAuth2 Refresh Token Grant

For OAuth2 providers that issue access and refresh tokens:

```ts
import { createAuth, oauth2Scheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("oauth:");

const auth = createAuth({
  schemes: [
    oauth2Scheme({
      store,
      tokenEndpoint: "https://auth.example.com/oauth/token",
      clientId: "my-spa-client",
      scopes: ["openid", "profile", "api"],
      tokenEndpointHeaders: { "X-Custom-Header": "value" },
      tokenEndpointBody: { audience: "https://api.example.com" },
    }),
  ],
  store,
  onRefreshFailure: () => {
    auth.clear();
    window.location.href = "/login";
  },
});

// After the OAuth callback, store the initial tokens:
auth.setTokens({
  accessToken: callbackResponse.access_token,
  refreshToken: callbackResponse.refresh_token,
  expiresIn: callbackResponse.expires_in,
});

const api = defineApi(config, { fetchFn: auth.fetchFn });
```

The `oauth2Scheme` sends a standard `refresh_token` grant to the token endpoint with `application/x-www-form-urlencoded` content type. It automatically stores the new tokens in the provided store.

### Custom Authentication (JWE, HMAC, Form-Based)

For non-standard auth flows, use `customScheme` to provide your own header generation and refresh logic:

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
        const form = new URLSearchParams({
          grant_type: "refresh_token",
          token: store.get("refresh_token") ?? "",
        });
        const res = await fetch("/auth/token", { method: "POST", body: form });
        if (!res.ok) throw new Error("JWE refresh failed");
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

### Combining Multiple Schemes

Some APIs require both Bearer authentication and an API key. Use `composeSchemes` to merge them:

```ts
import {
  createAuth,
  composeSchemes,
  bearerScheme,
  apiKeyScheme,
  localStorageStore,
} from "@simplix-react/auth";

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

// Every request carries both Authorization and X-API-Key headers
```

Headers from later schemes override earlier ones when names conflict.

## Variations

### React Integration

Wrap your app with `AuthProvider` to access auth state in components:

```tsx
import { AuthProvider, useAuth, useAuthFetch } from "@simplix-react/auth/react";

// In your app root
function App() {
  return (
    <AuthProvider auth={auth}>
      <Router />
    </AuthProvider>
  );
}

// In any component
function UserMenu() {
  const { isAuthenticated, login, logout, getAccessToken } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton onSuccess={(tokens) => login(tokens)} />;
  }

  return <button onClick={logout}>Logout</button>;
}

// For ad-hoc authenticated requests
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

The `useAuth` hook re-renders when `isAuthenticated` changes, powered by `useSyncExternalStore`.

### Subscribing to Auth Changes (Non-React)

Use `auth.subscribe` to react to auth state changes without React:

```ts
const unsubscribe = auth.subscribe(() => {
  console.log("Auth state changed:", auth.isAuthenticated());

  if (!auth.isAuthenticated()) {
    router.navigate("/login");
  }
});

// Clean up when done
unsubscribe();
```

### Low-Level: fetchFn Only

If you only need an authenticated fetch function without reactive state management, use `createAuthFetch` directly:

```ts
import { createAuthFetch, bearerScheme, memoryStore } from "@simplix-react/auth";

const store = memoryStore();
store.set("access_token", "my-token");

const fetchFn = createAuthFetch({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
});

const api = defineApi(config, { fetchFn });
```

### Error Handling

Auth errors use typed error codes for programmatic handling:

```ts
import { AuthError } from "@simplix-react/auth";

try {
  await auth.fetchFn("/api/protected");
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case "REFRESH_FAILED":
        // All refresh attempts failed — redirect to login
        break;
      case "TOKEN_EXPIRED":
        // Token has expired
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

### Testing Authenticated Requests

Use `memoryStore` for deterministic, isolated test auth:

```ts
import { createAuthFetch, bearerScheme, memoryStore } from "@simplix-react/auth";
import { defineApi } from "@simplix-react/contract";

const store = memoryStore();
store.set("access_token", "test-token-123");

const fetchFn = createAuthFetch({
  schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
});

const api = defineApi(testConfig, { fetchFn });
// All requests in tests carry: Authorization: Bearer test-token-123
```

## Related

- [Authentication Architecture](../core-concepts/authentication.md) --- design decisions and internals
- [Build a Protected App](../tutorials/auth-protected-app.md) --- step-by-step tutorial
- [Custom Fetch Functions](./custom-fetch.md) --- lower-level fetch customization without the auth package
- [Mock Handlers](./mock-handlers.md) --- set up MSW handlers for development
