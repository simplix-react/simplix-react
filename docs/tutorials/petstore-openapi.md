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
✔ Loaded: Swagger Petstore - OpenAPI 3.0 v1.0.x
i Multi-domain mode: pet(1), store(2), user(1)
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
      contract.ts                     # User-owned contract (customizeApi)
      hooks.ts                        # User-owned hooks (deriveHooks)
      generated/
        schemas.ts                    # Zod schemas from OpenAPI
        contract.ts                   # defineApi() contract
        hooks.ts                      # deriveHooks() React Query hooks
        form-hooks.ts                 # deriveFormHooks() TanStack Form hooks
        index.ts                      # Generated barrel export
      mock/
        index.ts                      # User-owned mock entry point
        seed.ts                       # Mock seed data
        generated/
          handlers.ts                 # deriveMockHandlers() MSW handlers
          seed.ts                     # Mock seed data
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
| `src/generated/hooks.ts` | contract | No (regenerated) | `deriveHooks()` — one line that produces all hooks from operations |
| `src/generated/form-hooks.ts` | contract + hooks | No (regenerated) | `deriveFormHooks()` — TanStack Form hooks for create/update |
| `src/mock/generated/handlers.ts` | contract | No (regenerated) | `deriveMockHandlers()` — MSW request handlers |
| `src/mock/generated/seed.ts` | OpenAPI schemas | No (regenerated) | Mock seed data for in-memory stores |
| `src/index.ts` | scaffold | Yes (user-owned) | Package entry point — add custom exports here |
| `src/contract.ts` | scaffold | Yes (user-owned) | Contract entry — use `customizeApi()` to patch generated contract |
| `src/hooks.ts` | scaffold | Yes (user-owned) | Hooks entry — `deriveHooks()` from user-owned contract |
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

The contract defines the API structure using `defineApi()`. Each entity declares
its own `operations` map — specifying HTTP method, path, and input schema per
operation:

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { petSchema, createPetSchema, updatePetSchema } from "./schemas.js";

export const petApi = defineApi({
  domain: "pet",
  basePath: "/api",
  entities: {
    pet: {
      schema: petSchema,
      operations: {
        create:         { method: "POST",   path: "/pet", input: createPetSchema },
        update:         { method: "PUT",    path: "/pet", input: updatePetSchema },
        get:            { method: "GET",    path: "/pet/:petId" },
        updateWithForm: { method: "POST",   path: "/pet/:petId" },
        delete:         { method: "DELETE", path: "/pet/:petId" },
        findByTags:     { method: "GET",    path: "/pet/findByTags" },
        findByStatus:   { method: "GET",    path: "/pet/findByStatus" },
        uploadFile:     { method: "POST",   path: "/pet/:petId/uploadImage" },
      },
    },
  },
  queryBuilder: simpleQueryBuilder,
});
```

Operations are extracted directly from the OpenAPI spec — every path+method
combination becomes an entry in the operations map. Standard CRUD names (`get`,
`create`, `update`, `delete`) are auto-detected by path pattern and HTTP method.
Custom operations (`findByStatus`, `findByTags`, `uploadFile`) are also included
and produce query/mutation hooks based on their HTTP method.

The `defineApi()` call produces a typed contract object that includes:

- A configured HTTP client (`petApi.client`)
- Query key factories (`petApi.queryKeys`)
- Full entity configuration (`petApi.config`)

### Hooks (`src/generated/hooks.ts`)

A single `deriveHooks()` call produces all hooks from the operations map:

```ts
import { deriveHooks } from "@simplix-react/react";
import { petApi } from "./contract.js";

export const petHooks = deriveHooks(petApi);
```

This derives hooks such as `petHooks.pet.useGet()`, `petHooks.pet.useCreate()`,
`petHooks.pet.useUpdate()`, and `petHooks.pet.useDelete()` — all fully typed
from the Zod schemas. Custom operations also produce hooks automatically:
`useFindByStatus()` and `useFindByTags()` as queries (GET method),
`useUploadFile()` as a mutation (POST method).

### Mock Handlers (`src/mock/generated/handlers.ts`)

A single `deriveMockHandlers()` call produces MSW handlers for all entities:

```ts
import type { HttpHandler } from "msw";
import { deriveMockHandlers } from "@simplix-react/mock";
import { petApi } from "../../generated/contract.js";

export const handlers: HttpHandler[] = deriveMockHandlers(petApi.config);
```

---

## Step 7: Customize Generated Contracts

The code generator maps CRUD roles automatically based on path patterns, HTTP
methods, and response types. However, some operations may need manual adjustment
to match your application's actual usage. The `contract.ts` file in each package
root (not the `generated/` directory) is **user-owned** and preserved during
regeneration — this is where you make customizations.

### Review the generated operation mapping

After generation, review each entity's operations:

| Entity | Generated Operations | Notes |
| --- | --- | --- |
| **pet** | create, update, get, delete, findByStatus, findByTags, updateWithForm, uploadFile | No `list` — the spec has no `GET /pet` endpoint |
| **order** | create, get, delete | No `list`, no `update` in the spec |
| **inventory** | inventory (custom op) | Returns a map (`Record<string, number>`), not an entity array |
| **user** | create, get, update, delete, login, logout, createWithListInput | No `list` in the spec |

### Why customize?

The code generator produces a **faithful mapping** of the OpenAPI spec, but your
application may need different semantics:

- **Promote a query to `list`**: `findByStatus` returns `Pet[]` and serves as
  the main listing endpoint — renaming it to `list` enables the full
  `useList()` / `useInfiniteList()` hook pattern
- **Remove deprecated operations**: `findByTags` is marked deprecated in the
  spec — you may want to exclude it
- **Clarify non-standard operations**: `inventory` returns a key-value map, not
  an entity list — the operation name should reflect this

### Example: Customize the pet domain

Edit `packages/sample-petstore-domain-pet/src/contract.ts`.
Use `customizeApi()` to apply only the diff — the rest of the generated contract
is inherited automatically:

```ts
export * from "./generated/schemas.js";

import { customizeApi } from "@simplix-react/contract";
import { petApi as _petApi } from "./generated/contract.js";

export const petApi = customizeApi(_petApi, {
  entities: {
    pet: {
      operations: {
        // findByStatus → list (primary listing endpoint)
        list: { method: "GET", path: "/pet/findByStatus", role: "list" },
        // Remove deprecated/redundant operations
        findByStatus: null,
        findByTags: null,
      },
    },
  },
});
```

`customizeApi()` takes the generated contract and applies a patch:

- An object value **adds or replaces** an operation
- A `null` value **removes** an operation
- Operations not mentioned are **preserved as-is**

The base contract is never mutated — a new contract with re-derived `client` and
`queryKeys` is returned.

Since `hooks.ts` derives hooks from `contract.ts`, the change propagates
automatically — `petHooks.pet.useList()` and `petHooks.pet.useInfiniteList()`
become available for the `findByStatus` endpoint.

---

## Step 8: Re-generate After Spec Changes (optional)

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

## Step 9: Create FSD Modules

Domain packages provide typed API contracts and hooks. FSD (Feature-Sliced
Design) modules consume these domain packages and organize the application
into independent, feature-based units.

Create two modules — `store` for the pet/store domains, and `user` for the
user domain:

```bash
simplix add-module store -y
simplix add-module user -y
```

Expected output:

```
✔ Module created: @sample-petstore/sample-petstore-store
  → Location: modules/sample-petstore-store/
  → FSD layers: features/ widgets/ shared/
  → i18n: locales/ with en, ko, ja

✔ Module created: @sample-petstore/sample-petstore-user
  → Location: modules/sample-petstore-user/
  → FSD layers: features/ widgets/ shared/
  → i18n: locales/ with en, ko, ja
```

Two new modules are created under `modules/`:

```
modules/
  sample-petstore-store/
    package.json
    tsup.config.ts
    tsconfig.json
    src/
      index.ts              # Module entry point
      manifest.ts           # Module metadata (id, name, navigation)
      features/index.ts     # Feature layer — domain-driven use cases
      widgets/index.ts      # Widget layer — compose features into UI blocks
      shared/               # Shared layer — lib, ui, config
      locales/              # i18n translations (en, ko, ja)
  sample-petstore-user/
    ...  (same structure)
```

Install and build the new modules:

```bash
pnpm install
pnpm build
```

### Module manifest

Each module exports a manifest that describes its metadata and navigation
entry:

```ts
// modules/sample-petstore-store/src/manifest.ts
export const storeManifest: ModuleManifest = {
  id: "store",
  name: "Store",
  version: "0.0.1",
  navigation: {
    label: "Store",
    icon: "Layout",
    path: "/store",
    order: 10,
  },
  capabilities: [],
};
```

### Domain ↔ Module relationship

Modules consume domain packages to build features. The `store` module will
use both the `pet` and `store` domain packages:

```
packages/ (domain layer)          modules/ (FSD layer)
├── domain-pet/   ─────────┐
│     contract, hooks,      ├──→  sample-petstore-store/
│     mock handlers         │       features/, widgets/
├── domain-store/ ─────────┘
│     contract, hooks,
│     mock handlers
└── domain-user/  ────────────→  sample-petstore-user/
      contract, hooks,              features/, widgets/
      mock handlers
```

To use domain hooks inside a module, add the domain package as a dependency
in the module's `package.json`:

```json
{
  "dependencies": {
    "simplix-react": "^0.1.3",
    "@sample-petstore/sample-petstore-domain-pet": "workspace:*",
    "@sample-petstore/sample-petstore-domain-store": "workspace:*"
  }
}
```

Then import the hooks in your feature code:

```ts
// modules/sample-petstore-store/src/features/pet-list.ts
import { petHooks } from "@sample-petstore/sample-petstore-domain-pet";

const { data } = petHooks.pet.useList();
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
7. **Customized** generated contracts — promoted `findByStatus` to `list`, removed deprecated operations
8. **Re-generated** after spec changes using snapshot-based diffing
9. **Created** two FSD modules (`store`, `user`) with `simplix add-module`

### Generated Pipeline

```
OpenAPI Spec
    |
    v
simplix openapi ──> Zod Schemas (schemas.ts)
                       |
                       v
                    defineApi() (contract.ts)
                    /       |        \
                   v        v         v
          deriveHooks()  deriveFormHooks()  deriveMockHandlers()
          (hooks.ts)     (form-hooks.ts)   (handlers.ts)
                               |
                               v
                    simplix add-module ──> FSD Modules
                        features/ ← domain hooks
                        widgets/  ← compose features
                        shared/   ← common utilities
```

### Next Steps

- [Build a Full-Stack Mock Application](./full-stack-mock.md) — use the
  generated hooks and mock handlers in a React application
- [CLI Reference](../guides/cli-usage.md) — explore all available CLI commands and flags
