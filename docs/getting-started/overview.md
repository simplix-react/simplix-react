# Overview

## What is simplix-react?

simplix-react is a **package-first React framework** that auto-generates reusable domain packages from OpenAPI specs. It provides a unified pipeline that starts with a single API contract definition and automatically derives type-safe HTTP clients, React Query hooks, and MSW mock handlers — eliminating boilerplate and keeping your entire data layer in sync.

## Core Philosophy: Define Once, Derive Everything

The central idea behind simplix-react is that your API contract is the **single source of truth**. You define your entities and operations once using Zod schemas, and the framework derives everything else:

```
Contract (Zod schemas)
    |
    +---> Client (type-safe HTTP client)
    |       |
    |       +---> Auth (Bearer, API Key, OAuth2)
    |
    +---> Hooks (TanStack Query hooks)
    |
    +---> Mock Handlers (MSW + PGlite)
```

This eliminates the common problem of manually keeping API types, client functions, query hooks, and mock data in sync. When the contract changes, every derived layer updates automatically with full type safety.

## The Pipeline

The simplix-react pipeline consists of three steps:

**Step 1 — Define the Contract**

Use `defineApi` with Zod schemas to describe your entities (CRUD resources) and operations (custom endpoints). This produces a typed client and query key factories.

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { z } from "zod";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: {
    task: {
      path: "/tasks",
      schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
      createSchema: z.object({ title: z.string(), status: z.string() }),
      updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

**Step 2 — Derive Hooks**

Pass the contract to `deriveHooks` to get React Query hooks for every entity — `useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, and `useInfiniteList`.

```ts
import { deriveHooks } from "@simplix-react/react";

const hooks = deriveHooks(projectApi);

// hooks.task.useList()
// hooks.task.useGet(id)
// hooks.task.useCreate()
// hooks.task.useUpdate()
// hooks.task.useDelete()
```

**Step 3 — Mock the Backend**

Derive MSW request handlers from the same contract. Combined with PGlite (an in-browser PostgreSQL), you get a fully functional mock backend with zero server setup.

```ts
import { deriveMockHandlers, setupMockWorker } from "@simplix-react/mock";

const handlers = deriveMockHandlers(projectApi.config);

await setupMockWorker({
  migrations: [runMigrations],
  seed: [seedData],
  handlers,
});
```

## Who Is It For?

simplix-react is designed for React developers who:

- Build **API-driven applications** with RESTful backends
- Want **type safety** across the entire data layer (contract → client → hooks → mocks)
- Prefer **convention over configuration** to reduce boilerplate
- Need a **mock data layer** for frontend-first development, demos, or offline usage
- Use **TanStack Query** for server state management

## Package Overview

| Package | npm | Description |
| --- | --- | --- |
| `@simplix-react/contract` | `@simplix-react/contract` | Zod-based type-safe API contract definitions. Entry point for `defineApi`. |
| `@simplix-react/react` | `@simplix-react/react` | Derives TanStack Query hooks from a contract via `deriveHooks`. |
| `@simplix-react/form` | `@simplix-react/form` | TanStack Form hooks derived from contracts via `deriveFormHooks`. |
| `@simplix-react/mock` | `@simplix-react/mock` | Generates MSW handlers and PGlite repositories from a contract. |
| `@simplix-react/auth` | `@simplix-react/auth` | Authentication middleware with Bearer, API Key, OAuth2, and custom schemes. |
| `@simplix-react/i18n` | `@simplix-react/i18n` | Internationalization framework built on i18next. |
| `@simplix-react/testing` | `@simplix-react/testing` | Testing utilities for simplix-react applications. |
| `@simplix-react/cli` | `@simplix-react/cli` | CLI for project scaffolding and validation. |

## Next Steps

- [Installation](./installation.md) — Set up simplix-react in your project
- [Quick Start](./quick-start.md) — Build your first contract-driven feature in 5 minutes
- [TypeScript Setup](./typescript.md) — Configure TypeScript for optimal type inference
