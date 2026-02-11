# Custom Fetch Functions

> How to customize the HTTP layer for authentication, headers, interceptors, and error handling.

## Before You Begin

- You have a contract defined with `defineApi` from `@simplix-react/contract`
- You understand the `FetchFn` type signature: `<T>(path: string, options?: RequestInit) => Promise<T>`
- The built-in `defaultFetch` adds `Content-Type: application/json`, unwraps `{ data: T }` envelopes, and throws `ApiError` on non-2xx responses

## Solution

### Basic: Add Authorization Headers

```ts
import { defineApi, defaultFetch } from "@simplix-react/contract";
import { projectConfig } from "./contract";

const projectApi = defineApi(projectConfig, {
  fetchFn: async (path, options) => {
    const token = localStorage.getItem("access_token");

    return defaultFetch(path, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  },
});
```

### Handle `ApiError` Responses

`defaultFetch` throws `ApiError` for any non-2xx status. Catch it to handle specific HTTP errors:

```ts
import { ApiError } from "@simplix-react/contract";

try {
  const task = await projectApi.client.task.get("nonexistent-id");
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status); // 404
    console.error(error.body);   // "Not Found"

    if (error.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
  }
}
```

### Request/Response Interceptors

Wrap `defaultFetch` to intercept requests before they are sent and responses after they arrive:

```ts
import { defineApi, defaultFetch, type FetchFn } from "@simplix-react/contract";
import { projectConfig } from "./contract";

function createFetchWithInterceptors(getToken: () => string | null): FetchFn {
  return async <T>(path: string, options?: RequestInit): Promise<T> => {
    // ── Request interceptor ──
    const token = getToken();
    const headers: Record<string, string> = {
      ...((options?.headers as Record<string, string>) ?? {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    headers["X-Request-Id"] = crypto.randomUUID();

    console.log(`[fetch] ${options?.method ?? "GET"} ${path}`);

    // ── Execute ──
    const result = await defaultFetch<T>(path, { ...options, headers });

    // ── Response interceptor ──
    console.log(`[fetch] ${path} -> OK`);

    return result;
  };
}

const projectApi = defineApi(projectConfig, {
  fetchFn: createFetchWithInterceptors(() => localStorage.getItem("access_token")),
});
```

### Retry Logic

Add retry behavior for transient failures (5xx, network errors):

```ts
import { defineApi, defaultFetch, ApiError, type FetchFn } from "@simplix-react/contract";
import { projectConfig } from "./contract";

function createFetchWithRetry(maxRetries = 3, delayMs = 1000): FetchFn {
  return async <T>(path: string, options?: RequestInit): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await defaultFetch<T>(path, options);
      } catch (error) {
        lastError = error;

        const isRetryable =
          error instanceof ApiError
            ? error.status >= 500
            : error instanceof TypeError; // network error

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt)),
        );
      }
    }

    throw lastError;
  };
}

const projectApi = defineApi(projectConfig, {
  fetchFn: createFetchWithRetry(3, 500),
});
```

### Fully Custom Fetch (No `defaultFetch`)

Replace the entire fetch implementation when the API does not follow the `{ data: T }` envelope convention:

```ts
import { defineApi, ApiError, type FetchFn } from "@simplix-react/contract";
import { projectConfig } from "./contract";

const customFetch: FetchFn = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // No { data } envelope -- return JSON directly
  return res.json() as Promise<T>;
};

const projectApi = defineApi(projectConfig, { fetchFn: customFetch });
```

## Variations

### Token Refresh on 401

```ts
import { defineApi, defaultFetch, ApiError, type FetchFn } from "@simplix-react/contract";
import { projectConfig } from "./contract";

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Token refresh failed");
  const { accessToken } = await res.json();
  localStorage.setItem("access_token", accessToken);
  return accessToken;
}

const fetchWithRefresh: FetchFn = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const token = localStorage.getItem("access_token");
  const headers = {
    ...((options?.headers as Record<string, string>) ?? {}),
    Authorization: `Bearer ${token}`,
  };

  try {
    return await defaultFetch<T>(path, { ...options, headers });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    // Deduplicate concurrent refresh calls
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise!;

    return defaultFetch<T>(path, {
      ...options,
      headers: {
        ...((options?.headers as Record<string, string>) ?? {}),
        Authorization: `Bearer ${newToken}`,
      },
    });
  }
};

const projectApi = defineApi(projectConfig, { fetchFn: fetchWithRefresh });
```

### Adding Base URL Prefix

```ts
import { defineApi, defaultFetch, type FetchFn } from "@simplix-react/contract";
import { projectConfig } from "./contract";

const API_BASE = "https://api.example.com";

const prefixedFetch: FetchFn = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  return defaultFetch<T>(`${API_BASE}${path}`, options);
};

const projectApi = defineApi(projectConfig, { fetchFn: prefixedFetch });
```

## Related

- [Mock Handlers](./mock-handlers.md) -- set up MSW handlers for development without a backend
- `@simplix-react/contract` types: `FetchFn`, `ApiError`, `defaultFetch`
