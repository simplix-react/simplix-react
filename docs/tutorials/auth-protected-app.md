# Build a Protected App with Authentication

> After completing this tutorial, you will have a React application with login/logout functionality, automatic token refresh, protected routes, and authenticated API requests --- all built with `@simplix-react/auth` and `@simplix-react/contract`.

## Prerequisites

- Node.js 18+
- pnpm installed globally
- Completed the [Project Management App tutorial](./project-app.md) or equivalent familiarity with `defineApi` and `deriveHooks`

## Step 1: Install the Auth Package

Start from an existing simplix-react project. Add the auth package:

```bash
pnpm add @simplix-react/auth
```

Verify the installation:

```bash
pnpm list @simplix-react/auth
```

**Expected result:** `@simplix-react/auth` appears in the dependency list.

## Step 2: Create the Auth Instance

Create a dedicated auth module that configures Bearer token authentication with automatic refresh.

Create `src/auth.ts`:

```ts
import { createAuth, bearerScheme, localStorageStore } from "@simplix-react/auth";

const store = localStorageStore("myapp:");

export const auth = createAuth({
  schemes: [
    bearerScheme({
      store,
      token: () => store.get("access_token"),
      refresh: {
        refreshFn: async () => {
          const refreshToken = store.get("refresh_token");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            throw new Error(`Refresh failed: ${res.status}`);
          }

          return res.json();
        },
        refreshBeforeExpiry: 60,
      },
    }),
  ],
  store,
  onRefreshFailure: () => {
    auth.clear();
    window.location.href = "/login";
  },
});
```

This configures:

- Bearer token authentication with `localStorage` persistence
- Automatic token refresh 60 seconds before expiry
- Redirect to `/login` when refresh fails

**Expected result:** The file compiles without errors. The `auth` object has `fetchFn`, `isAuthenticated`, `setTokens`, `clear`, and `subscribe` methods.

## Step 3: Connect Auth to the API Contract

Update your contract to use the authenticated fetch function.

Update `src/contract.ts`:

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { auth } from "./auth";

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const createProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "archived"]).default("active"),
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

export const projectApi = defineApi(
  {
    domain: "project",
    basePath: "/api/v1",
    entities: {
      project: {
        path: "/projects",
        schema: projectSchema,
        createSchema: createProjectSchema,
        updateSchema: updateProjectSchema,
      },
    },
    queryBuilder: simpleQueryBuilder,
  },
  { fetchFn: auth.fetchFn },
);
```

The only change is passing `auth.fetchFn` to `defineApi`. Every API request now automatically carries the Bearer token, handles 401 responses, and refreshes the token when needed.

**Expected result:** The file compiles. All existing hooks derived from `projectApi` now make authenticated requests without any changes.

## Step 4: Create the Login Page

Build a login page that sends credentials to the auth endpoint and stores the returned tokens.

Create `src/pages/LoginPage.tsx`:

```tsx
import { useState } from "react";
import { useAuth } from "@simplix-react/auth/react";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Login failed: ${res.status}`);
      }

      const tokens = await res.json();
      // tokens = { accessToken: "...", refreshToken: "...", expiresIn: 3600 }

      login(tokens);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
```

Key points:

- The login endpoint is called with plain `fetch` (not `auth.fetchFn`) because login happens before authentication
- `login(tokens)` stores the tokens in the configured store and notifies all subscribers
- After login, the page redirects to the home route

**Expected result:** The login form sends credentials, receives tokens, stores them, and redirects.

## Step 5: Create a Protected Route Guard

Build a component that redirects unauthenticated users to the login page.

Create `src/components/ProtectedRoute.tsx`:

```tsx
import type { ReactNode } from "react";
import { useAuth } from "@simplix-react/auth/react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}
```

This component checks `isAuthenticated` on every render. Since `useAuth` subscribes to the auth instance, the component re-renders when auth state changes (e.g., after logout or token expiry).

**Expected result:** Unauthenticated users are redirected to `/login`. Authenticated users see the children.

## Step 6: Add the Navbar with Logout

Create a navigation bar that shows auth state and provides a logout button.

Create `src/components/Navbar.tsx`:

```tsx
import { useAuth } from "@simplix-react/auth/react";

export function Navbar() {
  const { isAuthenticated, logout, getAccessToken } = useAuth();

  return (
    <nav>
      <a href="/">Project Manager</a>

      <div>
        {isAuthenticated ? (
          <>
            <span>Authenticated</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <a href="/login">Login</a>
        )}
      </div>
    </nav>
  );
}
```

When the user clicks "Logout":

1. `logout()` calls `auth.clear()`, which clears all schemes and the token store
2. The auth instance notifies all subscribers
3. `useAuth` re-renders with `isAuthenticated: false`
4. The `ProtectedRoute` component detects the change and redirects to `/login`

**Expected result:** The navbar shows "Authenticated" and a logout button when logged in. After logout, it shows a login link.

## Step 7: Wire Everything Together

Assemble the components into the main app with `AuthProvider`.

Update `src/App.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@simplix-react/auth/react";
import { auth } from "./auth";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { ProjectList } from "./components/ProjectList";
import { CreateProject } from "./components/CreateProject";

const queryClient = new QueryClient();

function AppContent() {
  // Simple routing based on pathname
  const isLoginPage = window.location.pathname === "/login";

  if (isLoginPage) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main>
        <h1>Project Manager</h1>
        <CreateProject />
        <ProjectList onSelect={(id) => console.log("Selected:", id)} />
      </main>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider auth={auth}>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

Important: `AuthProvider` must wrap all components that use `useAuth` or `useAuthFetch`, including the login page.

**Expected result:** The app shows a login page for unauthenticated users. After login, the project manager is accessible. Logout redirects back to the login page. All API requests carry the Bearer token automatically.

## Step 8: Test the Auth Flow

Verify the complete authentication flow works end-to-end.

### Manual Testing Checklist

1. Open the app in a browser --- you should be redirected to `/login`
2. Enter credentials and submit --- you should be redirected to the project list
3. Open DevTools Network tab --- all API requests should have an `Authorization: Bearer ...` header
4. Wait for the token to approach expiry --- a refresh request should fire automatically
5. Click "Logout" --- you should be redirected to `/login`
6. Open a new tab --- the auth state should persist (tokens are in `localStorage`)

### Unit Testing Auth State

Write a test that verifies the auth instance behavior:

```ts
import { describe, it, expect } from "vitest";
import { createAuth, bearerScheme, memoryStore } from "@simplix-react/auth";

describe("auth flow", () => {
  it("transitions from unauthenticated to authenticated on login", () => {
    const store = memoryStore();
    const auth = createAuth({
      schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
      store,
    });

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getAccessToken()).toBeNull();

    auth.setTokens({ accessToken: "abc", refreshToken: "xyz", expiresIn: 3600 });

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.getAccessToken()).toBe("abc");
  });

  it("clears all state on logout", () => {
    const store = memoryStore();
    store.set("access_token", "abc");
    const auth = createAuth({
      schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
      store,
    });

    expect(auth.isAuthenticated()).toBe(true);

    auth.clear();

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getAccessToken()).toBeNull();
  });

  it("notifies subscribers on state change", () => {
    const store = memoryStore();
    const auth = createAuth({
      schemes: [bearerScheme({ store, token: () => store.get("access_token") })],
      store,
    });

    let notified = false;
    auth.subscribe(() => { notified = true; });

    auth.setTokens({ accessToken: "abc" });
    expect(notified).toBe(true);
  });
});
```

**Expected result:** All three tests pass, confirming the auth instance transitions between states correctly.

## Summary

In this tutorial you:

1. Installed `@simplix-react/auth` and created an auth instance with Bearer token support
2. Connected the auth instance to `defineApi` via `fetchFn` --- existing hooks gained authentication with zero changes
3. Built a login page that stores tokens via `useAuth().login()`
4. Created a route guard that redirects unauthenticated users
5. Added logout functionality with automatic state propagation via `useSyncExternalStore`
6. Verified the complete auth flow with manual and unit tests

The auth layer is fully decoupled from the API contract. You can switch from `bearerScheme` to `oauth2Scheme` or add `apiKeyScheme` without changing any component code.

**Next steps:**

- Add [mock handlers](./full-stack-mock.md) for the auth endpoints to develop without a backend
- Configure [OAuth2 authentication](../guides/authentication.md#oauth2-refresh-token-grant) for production
- Add [custom schemes](../guides/authentication.md#custom-authentication-jwe-hmac-form-based) for non-standard auth flows
