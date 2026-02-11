# Build a Petstore API Client from OpenAPI

> After completing this tutorial, you will have a fully typed, multi-domain
> monorepo generated from the Swagger Petstore OpenAPI spec — with Zod schemas,
> React Query hooks, and MSW mock handlers, all derived automatically.

## Prerequisites

- Node.js 18 or later
- pnpm 9 or later
- `@simplix-react/cli` installed globally or via npx

```bash
npm install -g @simplix-react/cli
```

---

## Step 1: Initialize the Project

Create a new simplix-react monorepo:

```bash
simplix init sample-petstore -y
cd sample-petstore
```

This generates the following structure:

```
sample-petstore/
  apps/
    sample-petstore-demo/     # Vite + React demo application
  config/
    typescript/               # Shared TypeScript configs
  modules/                    # FSD modules (empty)
  packages/                   # Domain packages (empty)
  simplix.config.ts           # Project configuration
  package.json                # Root monorepo config
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json
```

Key file — `simplix.config.ts`:

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  api: {
    baseUrl: "/api",
  },
  mock: {
    defaultLimit: 50,
    maxLimit: 100,
    dataDir: "idb://sample-petstore-mock",
  },
  codegen: {
    header: true,
  },
});
```

Install dependencies:

```bash
pnpm install
```

Verify the initial build:

```bash
pnpm build
```

You should see `1 successful` task (the demo app).

---

## Step 2: Download the OpenAPI Spec

Download the Swagger Petstore 3.0 spec into the project root:

```bash
curl -sL "https://petstore3.swagger.io/api/v3/openapi.json" -o petstore.json
```

Inspect the available tags:

```bash
node -e "
  const s = JSON.parse(require('fs').readFileSync('petstore.json','utf8'));
  console.log('Title:', s.info.title);
  console.log('Tags:', s.tags.map(t => t.name).join(', '));
"
```

Expected output:

```
Title: Swagger Petstore - OpenAPI 3.0
Tags: pet, store, user
```

These three tags correspond to the three domains you will generate.

---

## Step 3: Configure Domain Splitting

Edit `simplix.config.ts` to add the `openapi.domains` section. Each key is a
domain name, and the value is an array of OpenAPI tag patterns to include:

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  api: {
    baseUrl: "/api",
  },
  http: {
    environments: {
      development: { baseUrl: "http://localhost:3000" },
    },
  },
  mock: {
    defaultLimit: 50,
    maxLimit: 100,
    dataDir: "idb://sample-petstore-mock",
  },
  codegen: {
    header: true,
  },
  openapi: {
    domains: {
      pet: ["pet"],
      store: ["store"],
      user: ["user"],
    },
  },
});
```

The `openapi.domains` mapping tells the CLI to split OpenAPI operations
by their tag into separate domain packages.

---

## Step 4: Generate Domain Packages

Run the OpenAPI code generator:

```bash
simplix openapi petstore.json -y
```

Expected output:

```
✔ Loaded: Swagger Petstore - OpenAPI 3.0 v1.0.27
i Multi-domain mode: pet(4), store(2), user(4)
✔ Created domain package: @sample-petstore/sample-petstore-domain-pet
✔ Created domain package: @sample-petstore/sample-petstore-domain-store
✔ Created domain package: @sample-petstore/sample-petstore-domain-user
```

Three new packages are created under `packages/`:

```
packages/
  sample-petstore-domain-pet/
    package.json
    tsup.config.ts
    tsconfig.json
    eslint.config.js
    src/
      index.ts                        # User-owned entry point
      generated/
        schemas.ts                    # Zod schemas from OpenAPI
        contract.ts                   # defineApi() contract
        hooks.ts                      # deriveHooks() React Query hooks
        index.ts                      # Generated barrel export
      mock/
        index.ts                      # User-owned mock entry point
        seed.ts                       # User-owned seed data
        generated/
          handlers.ts                 # deriveMockHandlers() MSW handlers
          migrations.ts               # SQL DDL for PGlite
    http/
      pet.http                        # HTTP request samples
      http-client.env.json
  sample-petstore-domain-store/
    ...  (same structure)
  sample-petstore-domain-user/
    ...  (same structure)
```

### What gets generated

| File | Source | Editable? | Description |
| --- | --- | --- | --- |
| `src/generated/schemas.ts` | OpenAPI schemas | No (regenerated) | Zod schemas derived from OpenAPI components |
| `src/generated/contract.ts` | OpenAPI paths + schemas | No (regenerated) | `defineApi()` contract with entity definitions |
| `src/generated/hooks.ts` | contract | No (regenerated) | `deriveHooks()` — one line that produces all CRUD hooks |
| `src/mock/generated/handlers.ts` | contract | No (regenerated) | `deriveMockHandlers()` — MSW request handlers |
| `src/mock/generated/migrations.ts` | OpenAPI schemas | No (regenerated) | SQL DDL for PGlite tables |
| `src/index.ts` | scaffold | Yes (user-owned) | Package entry point — add custom exports here |
| `src/mock/index.ts` | scaffold | Yes (user-owned) | Mock entry point — customize handler composition |
| `src/mock/seed.ts` | scaffold | Yes (user-owned) | Seed data for development |
| `package.json` | scaffold | Yes (user-owned) | Package metadata and dependencies |

---

## Step 5: Install and Build

Install the new domain package dependencies:

```bash
pnpm install
```

Build all packages:

```bash
pnpm build
```

Expected output:

```
 Tasks:    4 successful, 4 total
```

All three domain packages and the demo app build successfully.

---

## Step 6: Inspect the Generated Code

### Contract (`src/generated/contract.ts`)

The contract defines the API structure using `defineApi()`:

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { petSchema, createPetSchema, updatePetSchema } from "./schemas.js";

export const petApi = defineApi({
  domain: "pet",
  basePath: "/api/pet",
  entities: {
    pet: {
      path: "/pet",
      schema: petSchema,
      createSchema: createPetSchema,
      updateSchema: updatePetSchema,
    },
    // ... other entities
  },
  queryBuilder: simpleQueryBuilder,
});
```

The `defineApi()` call produces a typed contract object that includes:
- A configured HTTP client (`petApi.client`)
- Query key factories (`petApi.queryKeys`)
- Full entity configuration (`petApi.config`)

### Hooks (`src/generated/hooks.ts`)

A single `deriveHooks()` call produces all CRUD hooks:

```ts
import { deriveHooks } from "@simplix-react/react";
import { petApi } from "./contract.js";

export const petHooks = deriveHooks(petApi);
```

This derives hooks such as `petHooks.pet.useList()`, `petHooks.pet.useGet()`,
`petHooks.pet.useCreate()`, `petHooks.pet.useUpdate()`, and
`petHooks.pet.useDelete()` — all fully typed from the Zod schemas.

### Mock Handlers (`src/mock/generated/handlers.ts`)

A single `deriveMockHandlers()` call produces MSW handlers for all entities:

```ts
import type { HttpHandler } from "msw";
import { deriveMockHandlers } from "@simplix-react/mock";
import { petApi } from "../../generated/contract.js";

export const handlers: HttpHandler[] = deriveMockHandlers(petApi.config);
```

---

## Step 7: Re-generate After Spec Changes (optional)

When the OpenAPI spec is updated, re-run the same command:

```bash
simplix openapi petstore.json -y
```

The CLI compares the new spec against a `.openapi-snapshot.json` saved in each
domain package. It shows a diff of changes and regenerates only the
`src/generated/` and `src/mock/generated/` directories. User-owned files
(`src/index.ts`, `src/mock/seed.ts`, `package.json`) are preserved.

Use `--dry-run` to preview changes without writing:

```bash
simplix openapi petstore.json --dry-run
```

---

## Summary

In this tutorial, you:

1. **Initialized** a simplix-react monorepo with `simplix init`
2. **Downloaded** the Swagger Petstore OpenAPI spec
3. **Configured** tag-based domain splitting in `simplix.config.ts`
4. **Generated** three domain packages (`pet`, `store`, `user`) with `simplix openapi`
5. **Built** the entire project successfully
6. **Inspected** the generated contract, hooks, and mock handlers

### Generated Pipeline

```
OpenAPI Spec
    |
    v
simplix openapi ──> Zod Schemas (schemas.ts)
                       |
                       v
                    defineApi() (contract.ts)
                    /         \
                   v           v
          deriveHooks()    deriveMockHandlers()
          (hooks.ts)       (handlers.ts)
```

### Next Steps

- [Build a Full-Stack Mock Application](./full-stack-mock.md) — use the
  generated hooks and mock handlers in a React application
- [CLI Reference](../guides/cli-usage.md) — explore all available CLI commands and flags
