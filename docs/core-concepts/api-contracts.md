# API Contracts

## Overview

An API contract in simplix-react is a declarative description of every entity and operation your frontend needs to communicate with. Rather than scattering type definitions, endpoint URLs, and validation logic across your codebase, you declare them once in a single `defineApi()` call. The contract then becomes the single source of truth from which the framework derives HTTP clients, React Query hooks, mock handlers, and query key factories --- all fully typed.

The core insight behind contracts is that most of the code in a typical API integration layer is boilerplate that can be mechanically derived from a small set of declarations. If you know an entity's schema, its URL path, and its create/update payloads, you have enough information to generate everything else. simplix-react formalizes this observation into a framework.

Contracts exist at the boundary between your frontend and your API. They serve both as documentation (what does this API look like?) and as executable specifications (the framework enforces the declared shapes at every layer). This dual role eliminates the drift that normally occurs when types, endpoint URLs, and validation rules are maintained separately.

## How It Works

A contract is built from two fundamental building blocks: **EntityDefinition** and **OperationDefinition**.

### EntityDefinition

An `EntityDefinition` describes a CRUD-capable resource. It contains:

- **path** --- the URL segment (e.g. `"/tasks"`)
- **schema** --- a Zod schema defining the entity's response shape
- **createSchema** --- a Zod schema defining the creation payload
- **updateSchema** --- a Zod schema defining the update payload
- **parent** (optional) --- describes a parent resource for nested URL construction
- **queries** (optional) --- named query scopes for filtering by parent relationships
- **filterSchema** (optional) --- a Zod schema for validating list filter parameters

```ts
import { z } from "zod";

const taskEntity = {
  path: "/tasks",
  schema: z.object({ id: z.string(), title: z.string(), status: z.string() }),
  createSchema: z.object({ title: z.string(), status: z.string() }),
  updateSchema: z.object({ title: z.string().optional(), status: z.string().optional() }),
  parent: { param: "projectId", path: "/projects" },
};
```

From this single definition, the framework derives five CRUD methods (`list`, `get`, `create`, `update`, `delete`), six React Query hooks (`useList`, `useGet`, `useCreate`, `useUpdate`, `useDelete`, `useInfiniteList`), five MSW request handlers, and a structured query key factory.

### OperationDefinition

An `OperationDefinition` covers non-CRUD endpoints that don't fit the standard entity pattern --- file uploads, batch operations, RPC-style calls:

```ts
const assignTask = {
  method: "POST" as const,
  path: "/tasks/:taskId/assign",
  input: z.object({ userId: z.string() }),
  output: z.object({ id: z.string(), assigneeId: z.string() }),
  invalidates: (queryKeys) => [queryKeys.task.all],
};
```

Operations support path parameters (`:paramName` syntax), content type control (`json` or `multipart`), response type control (`json` or `blob`), and declarative cache invalidation via the `invalidates` function.

### Assembling the Contract

The `defineApi()` function takes an `ApiContractConfig` and returns a fully-typed contract object:

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";

const projectApi = defineApi({
  domain: "project",
  basePath: "/api/v1",
  entities: { task: taskEntity },
  operations: { assignTask },
  queryBuilder: simpleQueryBuilder,
});
```

The returned object contains three properties:

| Property | Description |
| --- | --- |
| `config` | The original configuration, passed through for downstream consumers |
| `client` | A type-safe HTTP client with methods for each entity and operation |
| `queryKeys` | Query key factories for TanStack Query cache management |

## Design Decisions

### Why Zod Schemas?

Zod was chosen as the schema language because it provides runtime validation and static type inference from a single declaration. With Zod, `z.infer<typeof schema>` produces the TypeScript type automatically, eliminating the need to maintain separate type definitions alongside validation logic. This is critical for the "define once, derive everything" philosophy --- the Zod schema is the sole definition from which all types flow.

Alternative schema libraries (Yup, io-ts, ArkType) were considered but lack Zod's combination of ergonomic API, broad ecosystem adoption, and seamless TypeScript inference.

### Why Domain-Scoped Contracts?

Each contract is scoped to a `domain` (e.g. `"project"`, `"billing"`, `"auth"`). This scoping decision has several consequences:

- **Query key isolation** --- all query keys start with `[domain, ...]`, preventing cache collisions between unrelated data
- **Organizational clarity** --- each domain maps to a logical API boundary
- **Independent derivation** --- contracts are composed at the application level, not at the framework level

### Why EntityDefinition and OperationDefinition Are Separate

Entities and operations serve fundamentally different purposes. Entities describe resources with predictable CRUD lifecycles; operations describe arbitrary actions. Keeping them separate allows the framework to generate complete CRUD scaffolding for entities while providing a flexible escape hatch for everything else.

### Why Contracts Include No Runtime Behavior

The `ApiContractConfig` is a pure data structure. It contains schemas and paths but no functions, no side effects, no runtime dependencies. This means contracts can be shared between packages (`@simplix-react/react`, `@simplix-react/mock`) without creating circular dependencies, and they can be serialized, inspected, or transformed by tooling.

The only exception is the optional `invalidates` function on operations, which is a pure function mapping query keys to invalidation targets.

## Implications

### For Application Developers

- You define your API surface once, in one place
- Type safety flows automatically from Zod schemas to every derived layer
- Adding a new entity means adding one `EntityDefinition` --- the client, hooks, mock handlers, and query keys are generated automatically
- Schema changes propagate instantly as TypeScript errors across the entire codebase

### For the Framework

- Contracts are the input to every derivation function (`deriveClient`, `deriveQueryKeys`, `deriveHooks`, `deriveMockHandlers`)
- The framework never needs to parse URLs, guess types, or infer structure --- the contract declares everything explicitly
- New derivation targets (e.g. OpenAPI spec generation, form builders) can be added without modifying existing contracts
