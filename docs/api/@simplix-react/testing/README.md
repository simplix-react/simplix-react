[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/testing

<p align="center">
  <img src="../../_media/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/testing

Testing utilities for simplix-react applications — pre-configured QueryClient, wrapper components, query helpers, and in-memory mock clients.

## Installation

```bash
pnpm add -D @simplix-react/testing
```

### Peer Dependencies

| Package | Version |
| --- | --- |
| `@simplix-react/contract` | `workspace:*` |
| `@tanstack/react-query` | `>= 5.0.0` |
| `react` | `>= 18.0.0` |

## Quick Example

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createTestWrapper, createMockClient } from "@simplix-react/testing";
import { contract } from "./my-contract";
import { useUsers } from "./use-users";

const mockClient = createMockClient(contract.config, {
  users: [{ id: "1", name: "Alice" }],
});

describe("useUsers", () => {
  const wrapper = createTestWrapper();

  it("returns user list", async () => {
    const { result } = renderHook(() => useUsers(mockClient), { wrapper });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toHaveLength(1);
  });
});
```

## API Overview

| Export | Description |
| --- | --- |
| `createTestQueryClient()` | Creates a `QueryClient` with retries disabled and zero gc/stale time |
| `createTestWrapper(options?)` | Creates a React wrapper component with all required providers |
| `waitForQuery(queryClient, queryKey, options?)` | Polls until a query resolves to a non-pending status |
| `createMockClient(config, data)` | Creates an in-memory CRUD client without MSW or network |

## Key Concepts

### Test Query Client

`createTestQueryClient` returns a `QueryClient` tuned for test environments:

- **No retries** — queries and mutations fail immediately on error
- **Zero gcTime** — prevents stale cache from leaking between tests
- **Zero staleTime** — ensures data is always re-fetched

```ts
import { createTestQueryClient } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

afterEach(() => {
  queryClient.clear();
});
```

### Test Wrapper

`createTestWrapper` produces a React component that wraps children with `QueryClientProvider`. Pass it as the `wrapper` option to `renderHook` or `render`.

```tsx
import { renderHook } from "@testing-library/react";
import { createTestWrapper } from "@simplix-react/testing";

const wrapper = createTestWrapper();
const { result } = renderHook(() => useMyHook(), { wrapper });
```

You can supply a custom `QueryClient` when you need to inspect or pre-populate the cache:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { createTestWrapper } from "@simplix-react/testing";

const queryClient = new QueryClient();
const wrapper = createTestWrapper({ queryClient });
```

### Mock Client

`createMockClient` builds an in-memory API client that matches the shape of a real `ApiContract.client`. Each entity exposes `list`, `get`, `create`, `update`, and `delete` methods backed by plain arrays — no MSW, no network.

```ts
import { createMockClient } from "@simplix-react/testing";
import { contract } from "./my-contract";

const mockClient = createMockClient(contract.config, {
  users: [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ],
});

const users = await mockClient.users.list();
// [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }]

await mockClient.users.create({ name: "Charlie" });
// users array now contains three items
```

Data mutations modify the seed arrays in place, so you can assert side effects directly:

```ts
await mockClient.users.delete("1");
const remaining = await mockClient.users.list();
expect(remaining).toHaveLength(1);
```

### waitForQuery

`waitForQuery` polls a `QueryClient` until a given query key leaves the `"pending"` status. It is useful when you need to wait for server state to settle outside of a rendering context.

```ts
import { createTestQueryClient, waitForQuery } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

// ... trigger a prefetch or background query ...

await waitForQuery(queryClient, ["users"], { timeout: 3000 });
const data = queryClient.getQueryData(["users"]);
expect(data).toBeDefined();
```

## Usage with Vitest

A typical Vitest setup file for simplix-react tests:

```ts
// vitest.setup.ts
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

In your test files:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createTestQueryClient,
  createTestWrapper,
  createMockClient,
} from "@simplix-react/testing";

const queryClient = createTestQueryClient();
const wrapper = createTestWrapper({ queryClient });

afterEach(() => {
  queryClient.clear();
});

describe("my hook", () => {
  it("fetches data", async () => {
    const { result } = renderHook(() => useMyHook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

## Related Packages

| Package | Description |
| --- | --- |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/mock` | MSW handlers + in-memory mock stores for integration testing |

## Interfaces

- [AccessTestWrapperOptions](interfaces/AccessTestWrapperOptions.md)
- [MockPolicyOptions](interfaces/MockPolicyOptions.md)

## Functions

- [createAccessTestWrapper](functions/createAccessTestWrapper.md)
- [createMockClient](functions/createMockClient.md)
- [createMockPolicy](functions/createMockPolicy.md)
- [createTestQueryClient](functions/createTestQueryClient.md)
- [createTestWrapper](functions/createTestWrapper.md)
- [waitForQuery](functions/waitForQuery.md)
