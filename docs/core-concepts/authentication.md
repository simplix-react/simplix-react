# Authentication

## Overview

Authentication in simplix-react is handled by `@simplix-react/auth`, a middleware package that sits between your API contracts and the HTTP layer. Rather than requiring you to manually inject tokens into every request, the auth package provides a strategy-based system where you declare your authentication schemes once and receive an authenticated `fetchFn` that plugs directly into `defineApi`.

The core insight is that authentication is orthogonal to your API contract. Your entity definitions and operations should not know or care about how requests are authenticated. By separating auth into its own layer, the same contract can be used with different auth strategies in different environments --- Bearer tokens in production, API keys in staging, no auth in tests.

## How It Works

The auth package follows the Strategy pattern. Each authentication method is encapsulated in an `AuthScheme` --- an object that knows how to produce HTTP headers, refresh credentials, and report its authentication state.

```
AuthScheme (interface)
    |
    +--- bearerScheme()    → Authorization: Bearer <token>
    |
    +--- apiKeyScheme()    → X-API-Key: <key> (header or query)
    |
    +--- oauth2Scheme()    → OAuth2 refresh_token grant
    |
    +--- customScheme()    → User-defined headers and refresh
```

Multiple schemes can be composed. When composed, their headers are merged and refresh is delegated to the first scheme that supports it.

### The Fetch Wrapper

The `createAuthFetch` function wraps a base `FetchFn` with authentication logic:

```
Request → scheme.getHeaders() → merge → baseFetchFn()
                                            |
                                        ApiError(401)?
                                            |
                                   RefreshManager.refresh()
                                   (single-flight dedup)
                                            |
                                     retry with fresh headers
                                            |
                                     fail → onRefreshFailure()
```

On every request, the wrapper:

1. Collects headers from all configured schemes
2. Merges auth headers **before** user-supplied headers (so you can override for impersonation)
3. Calls the base fetch function
4. On a 401 response, triggers token refresh through the `RefreshManager`
5. Retries the original request with fresh credentials
6. On refresh failure, calls `onRefreshFailure` and throws

### Single-Flight Refresh Deduplication

When multiple requests fail with 401 simultaneously, the `RefreshManager` ensures only one refresh operation executes. Subsequent callers await the same in-flight promise. This prevents the thundering herd problem where dozens of concurrent refresh requests overwhelm the auth server.

```
Request A (401) ──→ RefreshManager.refresh() ──→ refresh endpoint
Request B (401) ──→ RefreshManager.refresh() ──→ (awaits same promise)
Request C (401) ──→ RefreshManager.refresh() ──→ (awaits same promise)
                                                        |
                                                   all resolve together
```

### Token Storage

Tokens are stored in a `TokenStore` --- an abstraction over key-value storage. The package provides three implementations:

| Store | Persistence | Use case |
| --- | --- | --- |
| `memoryStore()` | None (process lifetime) | Testing, SSR |
| `localStorageStore(prefix?)` | Across sessions | Most web apps |
| `sessionStorageStore(prefix?)` | Current tab only | Sensitive apps |

All stores use a configurable key prefix (default: `"auth:"`) to avoid collisions with other data in the same storage backend.

## Design Decisions

### Why Strategy Pattern?

The strategy pattern was chosen for consistency with simplix-react's derivation model. Just as contracts derive clients and hooks, auth configs derive authenticated fetch functions. Strategies are composable --- you can combine Bearer + API Key without changing the contract layer.

Alternatives considered:

- **Middleware chain** (Express-style): More flexible but harder to type and compose for client-side use
- **Decorator pattern**: Similar outcome but less explicit about composition order
- **Monolithic auth class**: Would not support mixing auth methods or swapping strategies per environment

### Why Async Headers?

`AuthScheme.getHeaders()` is async even though most implementations return synchronous values. This is intentional --- token refresh, JWE decryption, and other credential operations are inherently asynchronous. Making the interface async from the start avoids breaking changes when async operations are needed.

### Why Auth Headers Before User Headers?

When merging headers, auth headers are applied first and user-supplied headers (from `RequestInit.headers`) override them:

```ts
{
  ...authHeaders,      // auth provides defaults
  ...options?.headers, // user can override
}
```

This ordering enables advanced patterns like request-level impersonation (`Authorization: Bearer <admin-token>`) without modifying the auth configuration.

### Why React Is Optional?

The core auth package (`@simplix-react/auth`) works without React. The `AuthInstance` returned by `createAuth` is a plain object with a `subscribe` method --- usable with any framework or no framework at all. React bindings are provided as a separate entry point (`@simplix-react/auth/react`) that wraps the core instance in context and `useSyncExternalStore`.

This separation means:

- Server-side code can use `createAuthFetch` directly
- Non-React frameworks (Vue, Svelte) can consume the core auth instance
- React apps get ergonomic hooks without sacrificing portability

### Why No Built-in Cookie Auth?

Cookie-based authentication (session cookies, CSRF tokens) is intentionally omitted because it typically requires server-side coordination (HttpOnly flags, SameSite policy, CSRF token endpoints) that varies significantly between backends. The `customScheme` function provides a clean escape hatch for cookie-based flows.

## Implications

### For Application Developers

- Authentication is configured once and injected into `defineApi` via `fetchFn`
- Token refresh, retry, and deduplication are handled automatically
- React components access auth state through hooks without prop drilling
- Switching auth strategies (e.g., from Bearer to OAuth2) requires changing the scheme configuration, not the application code

### For Testing

- Use `memoryStore()` with pre-set tokens to test authenticated requests
- Mock the `refreshFn` to test refresh flows
- The auth instance's `subscribe` method enables testing reactive state changes

## Related

- [Authentication Guide](../guides/authentication.md) --- how to set up auth in your app
- [Build a Protected App](../tutorials/auth-protected-app.md) --- step-by-step tutorial
- [Custom Fetch Functions](../guides/custom-fetch.md) --- lower-level fetch customization
- [API Contracts](./api-contracts.md) --- how contracts and `fetchFn` interact
