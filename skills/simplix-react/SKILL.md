---
name: simplix-react
description: Package-first React framework that auto-generates reusable domain packages from OpenAPI specs
version: 1.0.0
trigger: simplix-react
---

# simplix-react

> Define once. Derive everything.

## Architecture

```
Contract (Zod schemas)
    |
    +---> Client (type-safe HTTP)     -- deriveClient()
    +---> QueryKeys (cache keys)      -- deriveQueryKeys()
    +---> Hooks (React Query)         -- deriveHooks()
    +---> Mock Handlers (MSW)         -- deriveMockHandlers()
```

## Core API Quick Reference

### defineApi(config, options?)

Entry point. Returns `{ config, client, queryKeys }`.

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const api = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { /* EntityDefinition map */ },
  operations: { /* OperationDefinition map */ },
  queryBuilder: simpleQueryBuilder,
}, {
  fetchFn: customFetchFn, // optional
});
```

- `config.domain: string` -- query key namespace
- `config.basePath: string` -- URL prefix
- `config.entities: Record<string, EntityDefinition>` -- CRUD entities
- `config.operations?: Record<string, OperationDefinition>` -- custom endpoints
- `config.queryBuilder?: QueryBuilder` -- URL search param serializer
- `options.fetchFn?: FetchFn` -- custom fetch function (default: `defaultFetch`)

### EntityDefinition

```ts
interface EntityDefinition<TSchema, TCreate, TUpdate> {
  path: string;                    // URL segment, e.g. "/tasks"
  schema: TSchema;                 // Zod schema (response shape)
  createSchema: TCreate;           // Zod schema (create payload)
  updateSchema: TUpdate;           // Zod schema (update payload)
  parent?: EntityParent;           // nested URL: { param, path }
  queries?: Record<string, EntityQuery>;  // named query scopes
  filterSchema?: z.ZodType;        // list filter validation
}
```

### OperationDefinition

```ts
interface OperationDefinition<TInput, TOutput> {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;                    // with :paramName placeholders
  input: TInput;                   // Zod schema (request payload)
  output: TOutput;                 // Zod schema (response payload)
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (queryKeys, params) => readonly unknown[][];
}
```

### deriveHooks(contract)

Generates per-entity hooks + per-operation useMutation.

Entity hooks: `useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`

Operation hooks: `useMutation`

```ts
import { deriveHooks } from "@simplix-react/react";
const hooks = deriveHooks(api);

// Entity hooks
hooks.task.useList(parentId?, params?, options?);
hooks.task.useGet(id, options?);
hooks.task.useCreate(parentId?, options?);
hooks.task.useUpdate(options?);       // { optimistic?: boolean }
hooks.task.useDelete(options?);
hooks.task.useInfiniteList(parentId?, params?, options?);

// Operation hooks
hooks.assignTask.useMutation(options?);
```

### deriveMockHandlers(config, entityConfigs?)

Generates MSW `http.*` handlers backed by in-memory stores.

```ts
import { deriveMockHandlers } from "@simplix-react/mock";
const handlers = deriveMockHandlers(api.config, {
  task: { defaultLimit: 20 },
});
```

### setupMockWorker(config)

Bootstrap in-memory stores + MSW service worker.

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";

await setupMockWorker({
  domains: [
    {
      name: "project",
      handlers: deriveMockHandlers(api.config),
      seed: {
        project_tasks: [
          { id: 1, title: "First Task", completed: false },
        ],
      },
    },
  ],
});
```

### i18n

```ts
import { createI18nConfig, I18nextAdapter, buildModuleTranslations } from "@simplix-react/i18n";

const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations: import.meta.glob("./locales/**/*.json", { eager: true }),
});
```

### Testing

```ts
import { createTestQueryClient, createTestWrapper, createMockClient, waitForQuery } from "@simplix-react/testing";
```

## Terminology

| Use | Do NOT use |
| --- | --- |
| entity | model, resource |
| derive | generate, auto-create |
| contract | schema, spec, definition |
| operation | action, endpoint, rpc |
| mock handler | mock server, stub |

## Code Conventions

- File naming: kebab-case (`api-client.ts`, `use-query.ts`)
- One contract per domain (`project-api`, `billing-api`)
- Derive hooks once, export from a single hooks file
- Always use `simpleQueryBuilder` unless custom pagination needed
- `defaultFetch` unwraps `{ data: T }` envelope and throws `ApiError` on non-2xx

## Project Configuration

All project settings are centralized in `simplix.config.ts` at the project root:

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  api: { baseUrl: "/api" },           // API base path for code generation
  // packages: { prefix: "my-app" },  // Package naming prefix
  http: {                              // .http file environments
    environments: {
      development: { baseUrl: "http://localhost:3000" },
    },
  },
  mock: {                              // Mock layer defaults
    defaultLimit: 50,
    maxLimit: 100,
    defaultLimit: 50,
  },
  codegen: { header: true },           // Auto-generated file header
  // openapi: { domains: { ... } },    // OpenAPI tag-based domain splitting
});
```

See [Configuration Reference](./references/configuration.md) for full option details.

## When to Use This Skill

Activate when:

- Defining new API contracts with `defineApi`
- Adding entities or operations to existing contracts
- Setting up React Query hooks via `deriveHooks`
- Configuring mock data layer with MSW + in-memory stores
- Configuring `simplix.config.ts` project settings
- Debugging type errors in the derivation pipeline
- Setting up i18n with `createI18nConfig`
- Writing tests with `@simplix-react/testing`

## References

- [API Patterns](./references/api-patterns.md) -- Full API signatures and type details
- [Recipes](./references/recipes.md) -- Common patterns and complete code examples
- [Configuration](./references/configuration.md) -- `simplix.config.ts` option reference
