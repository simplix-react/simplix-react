# Recipes

Complete, copy-ready patterns for simplix-react. Contracts use the operations model (each entity is `schema` + an `operations` map). Prefer generating domains with the CLI — see [CLI & Scaffolding Workflow](./cli-workflow.md) — and reach for hand-authored contracts only when there is no OpenAPI spec.

## Contents

- [Scaffold a domain (CLI-first)](#scaffold-a-domain-cli-first)
- [Basic CRUD](#basic-crud)
- [Parent-Child Entities](#parent-child-entities)
- [Custom Operations](#custom-operations)
- [Customizing a generated contract](#customizing-a-generated-contract)
- [Optimistic Updates](#optimistic-updates)
- [Forms](#forms)
- [Filter and Sort](#filter-and-sort)
- [Custom Fetch](#custom-fetch)
- [i18n Integration](#i18n-integration)
- [Mock Layer Setup](#mock-layer-setup)
- [Testing](#testing)

---

## Scaffold a domain (CLI-first)

The preferred path. Generation keeps the contract, schemas, hooks, and mocks aligned.

```bash
# From an OpenAPI spec declared in simplix.config.ts openapi[]
simplix openapi openapi.json -y
pnpm install
# → packages/<prefix>-domain-<name>/ with defineApi(operations), schemas, hooks, mock
```

No spec? Generate a skeleton and fill its `operations`:

```bash
simplix add-domain inventory -y
```

Then author the contract as shown below.

---

## Basic CRUD

Define an entity, derive hooks, use in a component.

### 1. Define the Contract

```ts
// src/contract.ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

export const productSchema = z.object({
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
      schema: productSchema,
      operations: {
        list:   { method: "GET",    path: "/products" },
        get:    { method: "GET",    path: "/products/:id" },
        create: { method: "POST",   path: "/products", input: createProductSchema },
        update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
        delete: { method: "DELETE", path: "/products/:id" },
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

### 2. Derive Hooks

```ts
// src/hooks.ts
import { deriveEntityHooks } from "@simplix-react/react";
import { shopApi } from "./contract";

export const hooks = deriveEntityHooks(shopApi);
```

### 3. Use in Component

Hooks are fully typed from the contract — `products` is inferred as `Product[]`, mutation variables are checked. No annotations needed.

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
            <button onClick={() => deleteProduct.mutate(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
      {/* status is optional here because createProductSchema gives it .default("active") */}
      <button onClick={() => createProduct.mutate({ name: "New Product", price: 29.99 })}>
        Add Product
      </button>
    </div>
  );
}
```

---

## Parent-Child Entities

Nested entities use `parent` for hierarchical URLs. The CRUD paths still live in `operations`.

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
      schema: projectSchema,
      operations: {
        list:   { method: "GET",    path: "/projects" },
        get:    { method: "GET",    path: "/projects/:id" },
        create: { method: "POST",   path: "/projects", input: z.object({ name: z.string() }) },
        update: { method: "PATCH",  path: "/projects/:id", input: z.object({ name: z.string().optional() }) },
        delete: { method: "DELETE", path: "/projects/:id" },
      },
    },
    task: {
      schema: taskSchema,
      parent: { param: "projectId", path: "/projects" },
      operations: {
        list:   { method: "GET",    path: "/tasks" },
        get:    { method: "GET",    path: "/tasks/:id" },
        create: { method: "POST",   path: "/tasks", input: z.object({ title: z.string(), completed: z.boolean().default(false) }) },
        update: { method: "PATCH",  path: "/tasks/:id", input: z.object({ title: z.string().optional(), completed: z.boolean().optional() }) },
        delete: { method: "DELETE", path: "/tasks/:id" },
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

### Use Child Entity Hooks

```tsx
import { deriveEntityHooks } from "@simplix-react/react";

const hooks = deriveEntityHooks(projectApi);

function TaskList({ projectId }: { projectId: string }) {
  // Scoped to parent: GET /api/v1/projects/:projectId/tasks
  const { data: tasks } = hooks.task.useList(projectId);
  // Create under parent: POST /api/v1/projects/:projectId/tasks
  const createTask = hooks.task.useCreate(projectId);
  // Update and delete use the task's own ID
  const updateTask = hooks.task.useUpdate();
  const deleteTask = hooks.task.useDelete();

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => updateTask.mutate({ id: task.id, dto: { completed: !task.completed } })}
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
const tasks = await projectApi.client.task.list("proj-1");                  // under a project
const task = await projectApi.client.task.create("proj-1", { title: "New task" });
const fetched = await projectApi.client.task.get("task-1");                 // own ID
const updated = await projectApi.client.task.update("task-1", { completed: true });
await projectApi.client.task.delete("task-1");
```

---

## Custom Operations

Operations that don't fit standard CRUD. Two placements:

- **Entity operation** — an extra entry in an entity's `operations` map; derives a `use<Name>` hook and a `client.<entity>.<name>(...)` method.
- **Standalone operation** — a top-level `operations` entry (uses the standalone `OperationDefinition`, where `input`/`output` are required); derives `hooks.<name>.useMutation()` and `client.<name>(...)`.

Define operations **inline** in `defineApi`. Extracting one into a `const … satisfies OperationDefinition` widens its generics and de-types the derived `useMutation`. See [API Patterns → Type behavior & gotchas](./api-patterns.md#simplix-reactreact).

### Standalone operation

```ts
import { z } from "zod";
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import type { QueryKeyFactory } from "@simplix-react/contract";

const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  operations: {
    assignTask: {
      method: "POST",
      path: "/tasks/:taskId/assign",
      input: z.object({ userId: z.string() }),
      output: z.object({ id: z.string(), title: z.string(), assigneeId: z.string() }),
      // annotate queryKeys on standalone ops so contract inference is preserved
      invalidates: (queryKeys: Record<string, QueryKeyFactory>) => [queryKeys.task.all],
    },
  },
  queryBuilder: simpleQueryBuilder,
});

// Client: path params positional, then the input body
await api.client.assignTask("task-1", { userId: "user-42" });
```

```tsx
const hooks = deriveEntityHooks(api);

function AssignButton({ taskId }: { taskId: string }) {
  const { mutate, isPending } = hooks.assignTask.useMutation();
  return (
    <button disabled={isPending} onClick={() => mutate({ taskId, userId: "user-42" })}>
      Assign
    </button>
  );
}
```

### Entity operation (archive)

```ts
const taskEntity = {
  schema: taskSchema,
  operations: {
    list:    { method: "GET",    path: "/tasks" },
    get:     { method: "GET",    path: "/tasks/:id" },
    create:  { method: "POST",   path: "/tasks", input: createTaskSchema },
    update:  { method: "PATCH",  path: "/tasks/:id", input: updateTaskSchema },
    delete:  { method: "DELETE", path: "/tasks/:id" },
    archive: { method: "POST",   path: "/tasks/:id/archive", input: z.object({ reason: z.string() }) },
  },
};

// client.task.archive("task-1", { reason: "done" });  hooks.task.useArchive();
```

### File Upload (multipart)

An inline entry in `operations` (defining inline keeps the derived hook typed):

```ts
operations: {
  uploadAttachment: {
    method: "POST",
    path: "/tasks/:taskId/attachments",
    input: z.object({ file: z.instanceof(File), description: z.string().optional() }),
    output: z.object({ id: z.string(), url: z.string(), filename: z.string() }),
    contentType: "multipart",
  },
}

// const upload = hooks.uploadAttachment.useMutation();
// upload.mutate({ taskId: "task-1", file: selectedFile, description: "Screenshot" });
```

### Blob Response (file download)

```ts
operations: {
  downloadReport: {
    method: "GET",
    path: "/projects/:projectId/export",
    input: z.object({}),
    output: z.instanceof(Blob),
    responseType: "blob",
  },
}

// const blob = await api.client.downloadReport("proj-1");
// const url = URL.createObjectURL(blob);
```

---

## Customizing a generated contract

After `simplix openapi`, adapt the generated contract with `customizeApi` instead of editing generated files. It adds, replaces, or removes entity operations and returns a re-derived contract.

```ts
import { customizeApi } from "@simplix-react/contract";
import { petApi as generatedPetApi } from "./generated/pet-contract";

export const petApi = customizeApi(generatedPetApi, {
  entities: {
    pet: {
      operations: {
        // Replace: point list at a different endpoint
        list: { method: "GET", path: "/pet/findByStatus", role: "list" },
        // Add: a custom operation
        adopt: { method: "POST", path: "/pet/:id/adopt", input: z.object({ ownerId: z.string() }) },
        // Remove: an operation you don't want exposed
        findByTags: null,
      },
    },
  },
});

// Re-derive hooks from the customized contract
export const petHooks = deriveEntityHooks(petApi);
```

---

## Optimistic Updates

```tsx
function TaskItem({ task }: { task: Task }) {
  const updateTask = hooks.task.useUpdate({ optimistic: true });

  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => updateTask.mutate({ id: task.id, dto: { completed: !task.completed } })}
      />
      {task.title}
    </li>
  );
}
```

How it works: cancels in-flight queries → snapshots the list → updates the list cache immediately → rolls back to the snapshot on error → invalidates all entity queries on settlement.

---

## Forms

Derive TanStack Form hooks from the same contract with `deriveEntityFormHooks(contract, hooks)`.

```ts
// src/forms.ts
import { deriveEntityFormHooks } from "@simplix-react/form";
import { shopApi } from "./contract";
import { hooks } from "./hooks";

export const formHooks = deriveEntityFormHooks(shopApi, hooks);
```

### Create form

```tsx
import { formHooks } from "../forms";

function CreateProductForm() {
  const { form, isSubmitting, submitError } = formHooks.product.useCreateForm(undefined, {
    defaultValues: { name: "", price: 0 },
    onSuccess: (data) => console.log("Created", data),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
      <button type="submit" disabled={isSubmitting}>Create</button>
      {submitError && <p role="alert">{submitError.message}</p>}
    </form>
  );
}
```

### Edit form

```tsx
function EditProductForm({ productId }: { productId: string }) {
  // dirtyOnly defaults to true → only changed fields are sent (PATCH-friendly)
  const { form, isLoading, isSubmitting, entity } = formHooks.product.useUpdateForm(productId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => (
          <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        )}
      </form.Field>
      <button type="submit" disabled={isSubmitting}>Save</button>
    </form>
  );
}
```

For child entities, pass the parent id: `formHooks.task.useCreateForm(projectId)`.

---

## Filter and Sort

Using `ListParams` with `useList`.

### Basic Filtering

```tsx
const { data } = hooks.product.useList({ filters: { status: "active" } });
```

### Sorting

```tsx
const { data } = hooks.product.useList({ sort: { field: "price", direction: "desc" } });
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
    hooks.product.useInfiniteList(undefined, { limit: 20, filters: { status: "active" } });

  return (
    <div>
      {data?.pages.map((page) => page.data.map((product) => <div key={product.id}>{product.name}</div>))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
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

Prefer `createFetch` for auth headers, response transformation, and error handling — it covers the common cases declaratively. Hand-write a `FetchFn` only for logic `createFetch` can't express (e.g. token refresh).

### Preferred: createFetch

```ts
import { defineApi, createFetch } from "@simplix-react/contract";

const api = defineApi(config, {
  fetchFn: createFetch({
    getToken: () => localStorage.getItem("access_token"), // string | null → Authorization: Bearer
    transformResponse: (body) => (body as { data: unknown }).data, // unwrap envelope
    onError: (ctx) => reportError(ctx),
  }),
});
```

### Token Refresh on 401 (manual FetchFn)

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
    return defaultFetch<T>(path, { ...options, headers: { ...headers, Authorization: `Bearer ${newToken}` } });
  }
};

const api = defineApi(config, { fetchFn: fetchWithRefresh });
```

For full auth schemes (Bearer / API Key / OAuth2), token stores, and auto-refresh, use `@simplix-react/auth` (`createAuthFetch`) as the `fetchFn` — see its package README.

### No Envelope (API returns JSON directly)

```ts
import { defineApi, ApiError, type FetchFn } from "@simplix-react/contract";

const noEnvelopeFetch: FetchFn = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

const api = defineApi(config, { fetchFn: noEnvelopeFetch });
```

---

## i18n Integration

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

### Using Translations

```tsx
import { useTranslation } from "@simplix-react/i18n/react";

function Greeting() {
  const { t } = useTranslation("common");
  return <p>{t("greeting", { name: "Alice" })}</p>;
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

`useLocalePicker` from `@simplix-react/i18n/react` provides ready-made option objects for this.

### Formatting

```tsx
import { useI18n } from "@simplix-react/i18n/react";

function OrderSummary({ total, date }: { total: number; date: Date }) {
  const i18n = useI18n();
  if (!i18n) return null;

  return (
    <dl>
      <dt>Date</dt><dd>{i18n.formatDate(date, { dateStyle: "long" })}</dd>
      <dt>Total</dt><dd>{i18n.formatCurrency(total, "KRW")}</dd>
      <dt>Placed</dt><dd>{i18n.formatRelativeTime(date)}</dd>
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

const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations,
  moduleTranslations: [dashboardTranslations],
});
```

---

## Mock Layer Setup

### Basic Mock Setup

```ts
// src/mocks/handlers.ts
import { deriveMockHandlers } from "@simplix-react/mock";
import { shopApi } from "../contract";

export const handlers = deriveMockHandlers(shopApi.config, {
  product: { defaultLimit: 20, maxLimit: 100, defaultSort: "createdAt:desc" },
});
```

### With Relations

```ts
const handlers = deriveMockHandlers(projectApi.config, {
  task: {
    relations: {
      project: { entity: "project", localKey: "projectId", type: "belongsTo" },
    },
  },
});
```

### Full Mock Worker Setup

```ts
// src/mocks/setup.ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";
import { projectApi } from "../contract";

export async function startMocks() {
  await setupMockWorker({
    domains: [
      {
        name: "project",
        handlers: deriveMockHandlers(projectApi.config),
        seed: {
          project_projects: [{ id: 1, name: "Demo Project", status: "active" }],
          project_tasks: [{ id: 1, projectId: "1", title: "First Task", completed: false }],
        },
      },
    ],
  });
}
```

### Conditional Mock Loading

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

### Unit Test with Mock Client

```ts
import { describe, it, expect, afterEach } from "vitest";
import { createTestQueryClient, createTestWrapper, createMockClient } from "@simplix-react/testing";
import { shopApi } from "./contract";

describe("product hooks", () => {
  const queryClient = createTestQueryClient();
  const wrapper = createTestWrapper({ queryClient });

  afterEach(() => queryClient.clear());

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
import { deriveMockHandlers, seedEntityStore, resetStore } from "@simplix-react/mock";
import { shopApi } from "./contract";

const server = setupServer(...deriveMockHandlers(shopApi.config));

beforeAll(() => server.listen());
beforeEach(() => {
  resetStore();
  seedEntityStore("shop_products", [
    { id: 1, name: "Widget", price: 100, status: "active" },
    { id: 2, name: "Gadget", price: 200, status: "active" },
  ]);
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  resetStore();
});
```

### Wait for Query

```ts
import { waitForQuery, createTestQueryClient } from "@simplix-react/testing";

const queryClient = createTestQueryClient();
await waitForQuery(queryClient, shopApi.queryKeys.product.lists());
const data = queryClient.getQueryData(shopApi.queryKeys.product.lists());
expect(data).toBeDefined();
```

### Access-Gated UI

```tsx
import { createMockPolicy, createAccessTestWrapper } from "@simplix-react/testing";

const wrapper = createAccessTestWrapper({
  policy: createMockPolicy({ allowAll: false, rules: [{ action: "view", subject: "Product" }] }),
});
// render(<ProductList />, { wrapper });
```
