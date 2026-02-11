# Recipes

Common patterns and complete code examples for simplix-react.

## Basic CRUD

Define an entity, derive hooks, use in a component.

### 1. Define the Contract

```ts
// src/contract.ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  status: z.enum(["active", "discontinued"]),
  createdAt: z.string(),
});

const createProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  status: z.enum(["active", "discontinued"]).default("active"),
});

const updateProductSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  status: z.enum(["active", "discontinued"]).optional(),
});

export const shopApi = defineApi({
  domain: "shop",
  basePath: "/api/v1",
  entities: {
    product: {
      path: "/products",
      schema: productSchema,
      createSchema: createProductSchema,
      updateSchema: updateProductSchema,
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

### 2. Derive Hooks

```ts
// src/hooks.ts
import { deriveHooks } from "@simplix-react/react";
import { shopApi } from "./contract";

export const hooks = deriveHooks(shopApi);
```

### 3. Use in Component

```tsx
// src/components/product-list.tsx
import { hooks } from "../hooks";

export function ProductList() {
  const { data: products, isLoading } = hooks.product.useList();
  const createProduct = hooks.product.useCreate();
  const deleteProduct = hooks.product.useDelete();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <ul>
        {products?.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
            <button onClick={() => deleteProduct.mutate(product.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          createProduct.mutate({ name: "New Product", price: 29.99 })
        }
      >
        Add Product
      </button>
    </div>
  );
}
```

---

## Parent-Child Entities

Nested entities with parent config for hierarchical URLs.

### Define the Contract

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["active", "archived"]),
});

const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  completed: z.boolean(),
});

export const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    project: {
      path: "/projects",
      schema: projectSchema,
      createSchema: z.object({ name: z.string() }),
      updateSchema: z.object({ name: z.string().optional() }),
    },
    task: {
      path: "/tasks",
      schema: taskSchema,
      createSchema: z.object({
        title: z.string(),
        completed: z.boolean().default(false),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        completed: z.boolean().optional(),
      }),
      parent: {
        param: "projectId",
        path: "/projects",
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

### Use Child Entity Hooks

```tsx
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectApi);

function TaskList({ projectId }: { projectId: string }) {
  // Scoped to parent: GET /api/v1/projects/:projectId/tasks
  const { data: tasks } = hooks.task.useList(projectId);

  // Create under parent: POST /api/v1/projects/:projectId/tasks
  const createTask = hooks.task.useCreate(projectId);

  // Update and delete use entity's own ID
  const updateTask = hooks.task.useUpdate();
  const deleteTask = hooks.task.useDelete();

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() =>
              updateTask.mutate({
                id: task.id,
                dto: { completed: !task.completed },
              })
            }
          />
          {task.title}
          <button onClick={() => deleteTask.mutate(task.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}
```

### Use Client Directly

```ts
// List tasks under a project
const tasks = await projectApi.client.task.list("proj-1");

// Create task under a project
const task = await projectApi.client.task.create("proj-1", {
  title: "New task",
});

// Get, update, delete use task's own ID
const fetched = await projectApi.client.task.get("task-1");
const updated = await projectApi.client.task.update("task-1", {
  completed: true,
});
await projectApi.client.task.delete("task-1");
```

---

## Custom Operation

File upload, batch delete, RPC-style calls.

### Define an Operation

```ts
import { z } from "zod";
import type { OperationDefinition } from "@simplix-react/contract";

const assignTask = {
  method: "POST",
  path: "/tasks/:taskId/assign",
  input: z.object({ userId: z.string() }),
  output: z.object({
    id: z.string(),
    title: z.string(),
    assigneeId: z.string(),
  }),
  invalidates: (queryKeys) => [queryKeys.task.all],
} satisfies OperationDefinition;
```

### Register and Use

```ts
const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  operations: { assignTask },
  queryBuilder: simpleQueryBuilder,
});

// Client: path params are positional, then input body
await api.client.assignTask("task-1", { userId: "user-42" });
```

### Use Hook

```tsx
const hooks = deriveHooks(api);

function AssignButton({ taskId }: { taskId: string }) {
  const { mutate, isPending } = hooks.assignTask.useMutation();

  return (
    <button
      disabled={isPending}
      onClick={() => mutate({ taskId, userId: "user-42" })}
    >
      Assign
    </button>
  );
}
```

### File Upload (multipart)

```ts
const uploadAttachment = {
  method: "POST",
  path: "/tasks/:taskId/attachments",
  input: z.object({
    file: z.instanceof(File),
    description: z.string().optional(),
  }),
  output: z.object({
    id: z.string(),
    url: z.string(),
    filename: z.string(),
  }),
  contentType: "multipart",
} satisfies OperationDefinition;

// Usage
const upload = hooks.uploadAttachment.useMutation();
upload.mutate({ taskId: "task-1", file: selectedFile, description: "Screenshot" });
```

### Blob Response (file download)

```ts
const downloadReport = {
  method: "GET",
  path: "/projects/:projectId/export",
  input: z.object({}),
  output: z.instanceof(Blob),
  responseType: "blob",
} satisfies OperationDefinition;

// Usage
const blob = await api.client.downloadReport("proj-1");
const url = URL.createObjectURL(blob);
```

### Batch Delete

```ts
const bulkDelete = {
  method: "DELETE",
  path: "/tasks/bulk",
  input: z.object({ ids: z.array(z.string()) }),
  output: z.object({ deletedCount: z.number() }),
  invalidates: (queryKeys) => [queryKeys.task.all],
} satisfies OperationDefinition;
```

---

## Optimistic Updates

Use `useUpdate` with `optimistic: true` for instant UI feedback.

```tsx
function TaskItem({ task }: { task: Task }) {
  const updateTask = hooks.task.useUpdate({ optimistic: true });

  const toggleComplete = () => {
    updateTask.mutate({
      id: task.id,
      dto: { completed: !task.completed },
    });
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={toggleComplete}
      />
      {task.title}
    </li>
  );
}
```

How it works:

1. Cancels in-flight queries for this entity
2. Snapshots current list data
3. Immediately updates the list cache with new values
4. On error: rolls back to snapshot
5. On settlement (success or error): invalidates all entity queries

---

## Filter and Sort

Using `ListParams` with `useList`.

### Basic Filtering

```tsx
function ActiveProducts() {
  const { data } = hooks.product.useList({
    filters: { status: "active" },
  });

  return <ul>{data?.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### Sorting

```tsx
function SortedProducts() {
  const { data } = hooks.product.useList({
    sort: { field: "price", direction: "desc" },
  });

  return <ul>{data?.map((p) => <li key={p.id}>{p.name} - ${p.price}</li>)}</ul>;
}
```

### Multiple Sort Fields

```tsx
const { data } = hooks.product.useList({
  sort: [
    { field: "status", direction: "asc" },
    { field: "name", direction: "asc" },
  ],
});
```

### Pagination

```tsx
const { data } = hooks.product.useList({
  filters: { status: "active" },
  sort: { field: "createdAt", direction: "desc" },
  pagination: { type: "offset", page: 1, limit: 20 },
});
```

### Infinite Scrolling

```tsx
function ProductInfiniteList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    hooks.product.useInfiniteList(undefined, {
      limit: 20,
      filters: { status: "active" },
    });

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((product) => (
          <div key={product.id}>{product.name}</div>
        )),
      )}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

### Child Entity with Filters

```tsx
function FilteredTasks({ projectId }: { projectId: string }) {
  const { data } = hooks.task.useList(projectId, {
    filters: { status: "todo" },
    sort: { field: "createdAt", direction: "desc" },
  });

  return <ul>{data?.map((t) => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

---

## Custom Fetch

Add authentication headers, response transformation, retry logic.

### Auth Headers

```ts
import { defineApi, defaultFetch } from "@simplix-react/contract";

const api = defineApi(config, {
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

### Token Refresh on 401

```ts
import { defineApi, defaultFetch, ApiError, type FetchFn } from "@simplix-react/contract";

let refreshPromise: Promise<string> | null = null;

const fetchWithRefresh: FetchFn = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem("access_token");
  const headers = {
    ...((options?.headers as Record<string, string>) ?? {}),
    Authorization: `Bearer ${token}`,
  };

  try {
    return await defaultFetch<T>(path, { ...options, headers });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    if (!refreshPromise) {
      refreshPromise = refreshToken().finally(() => { refreshPromise = null; });
    }

    const newToken = await refreshPromise;
    return defaultFetch<T>(path, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
  }
};

const api = defineApi(config, { fetchFn: fetchWithRefresh });
```

### No Envelope (API returns JSON directly)

```ts
import { defineApi, ApiError, type FetchFn } from "@simplix-react/contract";

const noEnvelopeFetch: FetchFn = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

const api = defineApi(config, { fetchFn: noEnvelopeFetch });
```

---

## i18n Integration

Setting up translations with `@simplix-react/i18n`.

### Basic Setup

```ts
// src/app/i18n/index.ts
import { createI18nConfig } from "@simplix-react/i18n";

const appTranslations = import.meta.glob("../../locales/**/*.json", { eager: true });

export const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  fallbackLocale: "en",
  appTranslations,
});
```

### App Entry Point

```tsx
// src/main.tsx
import { I18nProvider } from "@simplix-react/i18n/react";
import { adapter, i18nReady } from "./app/i18n/index.js";

async function bootstrap() {
  await i18nReady;

  createRoot(document.getElementById("root")!).render(
    <I18nProvider adapter={adapter}>
      <App />
    </I18nProvider>,
  );
}

bootstrap();
```

### Using Translations in Components

```tsx
import { useTranslation } from "@simplix-react/i18n/react";

function Greeting() {
  const { t, locale } = useTranslation("common");

  return <p>{t("greeting", { name: "Alice" })}</p>;
  // ko: "Alice님, 안녕하세요!"
  // en: "Hello, Alice!"
}
```

### Locale Switcher

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function LocaleSwitcher() {
  const i18n = useI18n();
  if (!i18n) return null;

  return (
    <select value={i18n.locale} onChange={(e) => i18n.setLocale(e.target.value)}>
      {i18n.availableLocales.map((code) => {
        const info = i18n.getLocaleInfo(code);
        return <option key={code} value={code}>{info?.name ?? code}</option>;
      })}
    </select>
  );
}
```

### Formatting

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function OrderSummary({ total, date }: { total: number; date: Date }) {
  const i18n = useI18n();
  if (!i18n) return null;

  return (
    <dl>
      <dt>Date</dt>
      <dd>{i18n.formatDate(date, { dateStyle: "long" })}</dd>
      <dt>Total</dt>
      <dd>{i18n.formatCurrency(total, "KRW")}</dd>
      <dt>Placed</dt>
      <dd>{i18n.formatRelativeTime(date)}</dd>
    </dl>
  );
}
```

### Lazy-Loading Module Translations

```ts
import { buildModuleTranslations } from "@simplix-react/i18n";

export const dashboardTranslations = buildModuleTranslations({
  namespace: "dashboard",
  locales: ["en", "ko"],
  components: {
    header: {
      en: () => import("./header/locales/en.json"),
      ko: () => import("./header/locales/ko.json"),
    },
  },
});

// Pass to createI18nConfig
const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations,
  moduleTranslations: [dashboardTranslations],
});
```

---

## Mock Layer Setup

Setting up MSW + PGlite for development and testing.

### Basic Mock Setup

```ts
// src/mocks/handlers.ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { shopApi } from "../contract";

export const handlers = deriveMockHandlers(shopApi.config, {
  product: {
    tableName: "products",
    defaultLimit: 20,
    maxLimit: 100,
    defaultSort: "created_at DESC",
  },
});
```

### With Relations

```ts
const handlers = deriveMockHandlers(projectApi.config, {
  task: {
    tableName: "tasks",
    relations: {
      project: {
        table: "projects",
        localKey: "projectId",
        type: "belongsTo",
      },
    },
  },
});
```

### Full Mock Worker Setup

```ts
// src/mocks/setup.ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import type { PGlite } from "@electric-sql/pglite";
import { projectApi } from "../contract";

async function runMigrations(db: PGlite) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id TEXT NOT NULL REFERENCES projects(id),
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

async function seedData(db: PGlite) {
  await db.query(`
    INSERT INTO projects (id, name) VALUES ('proj-1', 'Demo Project');
    INSERT INTO tasks (id, project_id, title) VALUES ('task-1', 'proj-1', 'First Task');
  `);
}

export async function startMocks() {
  await setupMockWorker({
    dataDir: "idb://project-mock",
    migrations: [runMigrations],
    seed: [seedData],
    handlers: deriveMockHandlers(projectApi.config),
  });
}
```

### Conditional Mock Loading in main.tsx

```tsx
async function bootstrap() {
  if (import.meta.env.DEV) {
    const { startMocks } = await import("./mocks/setup");
    await startMocks();
  }

  createRoot(document.getElementById("root")!).render(<App />);
}

bootstrap();
```

---

## Testing

Setting up the mock layer for unit and integration tests.

### Unit Test with Mock Client

```ts
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import {
  createTestQueryClient,
  createTestWrapper,
  createMockClient,
} from "@simplix-react/testing";
import { shopApi } from "./contract";
import { hooks } from "./hooks";

describe("product hooks", () => {
  const queryClient = createTestQueryClient();
  const wrapper = createTestWrapper({ queryClient });

  afterEach(() => {
    queryClient.clear();
  });

  it("lists products", async () => {
    const mockClient = createMockClient(shopApi.config, {
      product: [
        { id: "1", name: "Widget", price: 100 },
        { id: "2", name: "Gadget", price: 200 },
      ],
    });

    // Use mockClient with your hooks...
  });
});
```

### Integration Test with MSW

```ts
import { setupServer } from "msw/node";
import { deriveMockHandlers } from "@simplix-react/mock";
import { initPGlite, resetPGliteInstance } from "@simplix-react/mock";
import { shopApi } from "./contract";

const handlers = deriveMockHandlers(shopApi.config);
const server = setupServer(...handlers);

beforeAll(async () => {
  const db = await initPGlite("memory://test");
  await db.query(`
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  server.listen();
});

afterEach(() => server.resetHandlers());

afterAll(() => {
  server.close();
  resetPGliteInstance();
});
```

### Wait for Query

```ts
import { waitForQuery, createTestQueryClient } from "@simplix-react/testing";

const queryClient = createTestQueryClient();

// ... trigger a query fetch ...

await waitForQuery(queryClient, shopApi.queryKeys.product.lists());
const data = queryClient.getQueryData(shopApi.queryKeys.product.lists());
expect(data).toBeDefined();
```

### Custom Timeout

```ts
await waitForQuery(queryClient, ["products"], { timeout: 10000 });
```
