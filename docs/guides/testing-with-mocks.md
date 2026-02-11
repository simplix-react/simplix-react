# How to Set Up a Test Environment with Mock Utilities

> Configure Vitest and React Testing Library with simplix-react's testing helpers for deterministic, leak-free component and hook tests.

## Before You Begin

- A simplix-react project with at least one domain package
- Install testing dependencies:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @simplix-react/testing
```

- A Vitest configuration with `jsdom` environment:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

## Solution

### Step 1 -- Create a Test QueryClient

`createTestQueryClient` returns a `QueryClient` pre-configured for deterministic test execution. It disables retries and garbage collection so queries resolve immediately and do not leak state:

```ts
import { createTestQueryClient } from "@simplix-react/testing";

const queryClient = createTestQueryClient();
```

Applied defaults:

| Option | Value | Reason |
| --- | --- | --- |
| `queries.retry` | `false` | Fail immediately on error |
| `queries.gcTime` | `0` | No cache retention between tests |
| `queries.staleTime` | `0` | Always refetch |
| `mutations.retry` | `false` | Fail immediately on error |

Clear the client between tests to prevent state leakage:

```ts
afterEach(() => {
  queryClient.clear();
});
```

### Step 2 -- Create a Test Wrapper

`createTestWrapper` returns a React component that wraps children with all required providers (`QueryClientProvider`). Pass it as the `wrapper` option to `renderHook` or `render`:

```tsx
import { renderHook } from "@testing-library/react";
import { createTestWrapper } from "@simplix-react/testing";

const wrapper = createTestWrapper();

const { result } = renderHook(() => useMyQuery(), { wrapper });
```

To inject a specific `QueryClient`:

```tsx
import { createTestQueryClient, createTestWrapper } from "@simplix-react/testing";

const queryClient = createTestQueryClient();
const wrapper = createTestWrapper({ queryClient });
```

### Step 3 -- Create a Mock Client for Unit Tests

`createMockClient` creates an in-memory CRUD client that mirrors the shape of a real API client without requiring MSW or any network layer. Data is stored in plain arrays that you seed and inspect directly:

```ts
import { createMockClient } from "@simplix-react/testing";
import { contract } from "@myapp/myapp-domain-inventory";

const mockClient = createMockClient(contract.config, {
  products: [
    { id: "1", name: "Widget", price: 100 },
    { id: "2", name: "Gadget", price: 200 },
  ],
});
```

Available CRUD methods per entity:

| Method | Signature | Description |
| --- | --- | --- |
| `list` | `(params?) => Promise<T[]>` | Returns all seeded items |
| `get` | `(id) => Promise<T>` | Finds by `id`, rejects if not found |
| `create` | `(dto) => Promise<T>` | Appends with auto-generated `id` |
| `update` | `(id, dto) => Promise<T>` | Merges fields, rejects if not found |
| `delete` | `(id) => Promise<void>` | Removes by `id`, rejects if not found |

```ts
// List
const products = await mockClient.products.list();
expect(products).toHaveLength(2);

// Create
const created = await mockClient.products.create({ name: "Doohickey", price: 50 });
expect(created.id).toBeDefined();

// Update
const updated = await mockClient.products.update("1", { price: 150 });
expect(updated.price).toBe(150);

// Delete
await mockClient.products.delete("2");
const remaining = await mockClient.products.list();
expect(remaining).toHaveLength(2); // original 2 - 1 deleted + 1 created
```

### Step 4 -- Wait for Queries to Settle

`waitForQuery` polls the `QueryClient` cache until a specific query key resolves (leaves `"pending"` status). Use it when you need to wait for server state without relying on UI-level `waitFor`:

```ts
import { createTestQueryClient, waitForQuery } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

// ... trigger a query fetch ...

await waitForQuery(queryClient, ["products"]);

const data = queryClient.getQueryData(["products"]);
expect(data).toBeDefined();
```

Configure the timeout (default: 5000 ms):

```ts
await waitForQuery(queryClient, ["products"], { timeout: 10000 });
```

### Step 5 -- Full Integration Test Example

Combine all utilities for a complete hook test:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createTestQueryClient,
  createTestWrapper,
  createMockClient,
} from "@simplix-react/testing";
import { contract } from "@myapp/myapp-domain-inventory";
import { useProducts } from "@myapp/myapp-domain-inventory/react";

describe("useProducts", () => {
  const queryClient = createTestQueryClient();
  const wrapper = createTestWrapper({ queryClient });

  const mockClient = createMockClient(contract.config, {
    products: [
      { id: "1", name: "Widget", price: 100 },
    ],
  });

  afterEach(() => {
    queryClient.clear();
  });

  it("returns product list", async () => {
    const { result } = renderHook(
      () => useProducts({ client: mockClient }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("Widget");
  });
});
```

## Variations

### Using MSW for HTTP-Level Mocking

For tests that need to exercise the actual HTTP layer, use MSW (Mock Service Worker) alongside the testing utilities. Domain packages generated by `simplix add-domain` include MSW handler templates:

```ts
import { setupServer } from "msw/node";
import { handlers } from "@myapp/myapp-domain-inventory/mock";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Combine with `createTestWrapper` for component tests:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { createTestWrapper } from "@simplix-react/testing";
import { ProductList } from "./product-list.js";

const wrapper = createTestWrapper();

it("renders products from MSW", async () => {
  render(<ProductList />, { wrapper });

  await waitFor(() => {
    expect(screen.getByText("Widget")).toBeInTheDocument();
  });
});
```

### Testing Components with i18n

When testing components that use `useTranslation`, add the `I18nProvider` to your wrapper:

```tsx
import { createElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@simplix-react/i18n/react";
import { createTestQueryClient } from "@simplix-react/testing";
import { adapter, i18nReady } from "./test-i18n-setup.js";

async function createI18nTestWrapper() {
  const queryClient = createTestQueryClient();
  await i18nReady;

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(I18nProvider, { adapter }, children),
    );
  };
}
```

### Custom QueryClient for Specific Tests

Override the default test client when you need specific behavior (e.g., enabling retries for retry-logic tests):

```ts
import { QueryClient } from "@tanstack/react-query";
import { createTestWrapper } from "@simplix-react/testing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 100,
    },
  },
});

const wrapper = createTestWrapper({ queryClient });
```

## Related

- [Internationalization](./internationalization.md) -- Setting up i18n (relevant for testing i18n components)
- [CLI Usage](./cli-usage.md) -- `simplix add-domain` generates mock handler templates
- [@simplix-react/testing source](../../packages/testing/src/)
