---
name: simplix-react
description: Package-first React framework that derives a type-safe client, React Query hooks, TanStack Form hooks, and MSW mocks from one Zod/OpenAPI contract per domain. Use this skill whenever working in a simplix-react repo — recognizable by a `simplix.config.ts` at the root or packages scoped `@simplix-react/*` / `@simplix-react-ext/*`. Triggers include defining or editing contracts with `defineApi`, deriving hooks via `deriveEntityHooks` / `deriveEntityFormHooks`, wiring MSW mocks, configuring `simplix.config.ts`, running the `simplix` CLI, or writing tests with `@simplix-react/testing`. ALWAYS consult this skill before hand-writing fetch / React Query / form code, or before manually creating a new domain, module, or package — simplix-react is framework-first and requires CLI scaffolding (`simplix init` / `add-domain` / `add-module` / `openapi` / `scaffold`) plus OpenAPI codegen, package/module (FSD) separation, and contract-driven derivation rather than hand-rolled files.
---

# simplix-react

> Define once. Derive everything.

You author ONE contract per domain — Zod schemas plus an `operations` map, usually generated from an OpenAPI spec — and the framework DERIVES the type-safe client, TanStack Query hooks, TanStack Form hooks, and MSW mock handlers from it. Generated domain code lives in reusable `packages/`; feature/UI code lives in Feature-Sliced Design (FSD) `modules/`.

## Work the framework's way (read first)

Three rules govern every change. They exist because simplix-react's value is a single source of truth — the contract. Bypassing it forks that source and the derivation silently drifts.

1. **Framework-first — derive, don't hand-roll.** Need fetching, caching, a form, or a mock for something the contract describes? Derive it (`deriveEntityHooks`, `deriveEntityFormHooks`, `deriveMockHandlers`). Do not write bespoke `fetch` / `useQuery` / form state for it. Extend through the seams (`options.fetchFn`, `createFetch`, `customizeApi`), not by rewriting derived output.

2. **Package-first & module separation.** Reusable, contract-derived code (contracts, schemas, hooks, mocks) belongs in `packages/` — never copied into an app. Feature/UI code belongs in FSD `modules/` and obeys the layer rule `features/ → widgets/ → shared/`: `features/` must not import from `widgets/`, and `shared/` must not import from `features/` or `widgets/`. `simplix validate` enforces this.

3. **CLI + OpenAPI codegen first — scaffold, don't hand-create.** Generate new projects, domains, modules, and CRUD UI with the `simplix` CLI rather than authoring files by hand. When an OpenAPI spec exists, generation is the source of truth — refine with `customizeApi`, never by editing generated files.

### "I need to…" → do this

| Goal | Do | Not |
| --- | --- | --- |
| Start a project | `simplix init <name>` | hand-create folders |
| Add a domain from an API spec | `simplix openapi <spec>` | hand-write contract + schemas |
| Add a domain by hand | `simplix add-domain <name>`, then fill `operations` | put a contract inside an app |
| Add a feature module | `simplix add-module <name>` | put features in `packages/` |
| Generate CRUD UI for an entity | `simplix scaffold <entity>` | hand-build list/form/detail |
| Adjust a generated contract | `customizeApi(base, patch)` | edit generated files |
| Fetch / mutate data | `deriveEntityHooks` → `useList` / `useGet` / … | `useQuery` + manual `fetch` |
| Build a create/edit form | `deriveEntityFormHooks` → `useCreateForm` / `useUpdateForm` | hand-managed form state |
| Mock the API (dev & tests) | `deriveMockHandlers` + `setupMockWorker` | hand-written MSW handlers |
| Start a native (Expo) app | `simplix add-app <name> --native` | hand-create the Expo shell |
| Generate native entity screens | `simplix scaffold <entity> --native` | hand-build EntityList/detail/form |
| Check structure / FSD / imports | `simplix validate` | — |

Full command reference and step-by-step walkthroughs: [CLI & Scaffolding Workflow](./references/cli-workflow.md).

## Architecture

```
OpenAPI spec ──(simplix openapi)──▶ Contract  (Zod schemas + operations map)
                                       │  defineApi(config) → { config, client, queryKeys }
       ┌───────────────┬──────────────┼────────────────┬────────────────────┐
       ▼               ▼              ▼                ▼                    ▼
    client         queryKeys     Query hooks       Form hooks         Mock handlers
  deriveClient   deriveQueryKeys  deriveEntity-     deriveEntity-      deriveMock-
  (internal)     (internal)       Hooks(contract)   FormHooks(c,hooks) Handlers(config)
```

## Project layout

```
my-app/
  simplix.config.ts          # central config (plugins, api, openapi, ...)
  packages/                  # generated, reusable domain packages
    <prefix>-domain-<name>/  #   contract + schemas + derived hooks + mock
  modules/                   # FSD feature modules
    <module>/src/{features,widgets,shared}/ + manifest.ts + locales/
  apps/                      # app shells composing modules
```

## Authoring a contract

One `defineApi` call per domain. Each entity is a `schema` plus an `operations` map; every operation carries its own `method` and `path`, and `create` / `update` carry an `input` schema. `CRUD_OPERATIONS` supplies the standard method defaults to spread in.

```ts
import { defineApi, simpleQueryBuilder } from "@simplix-react/contract";
import { productSchema, createProductSchema, updateProductSchema } from "./schemas";

export const shopApi = defineApi({
  domain: "shop",                 // query-key namespace
  basePath: "/api/v1",            // URL prefix
  entities: {
    product: {
      schema: productSchema,      // response shape
      operations: {
        list:   { method: "GET",    path: "/products" },
        get:    { method: "GET",    path: "/products/:id" },
        create: { method: "POST",   path: "/products", input: createProductSchema },
        update: { method: "PATCH",  path: "/products/:id", input: updateProductSchema },
        delete: { method: "DELETE", path: "/products/:id" },
      },
    },
  },
  queryBuilder: simpleQueryBuilder, // optional but recommended (serializes filters/sort/pagination)
});
```

### defineApi(config, options?)

Entry point. Returns `{ config, client, queryKeys }`.

- `config.domain: string` — query-key namespace
- `config.basePath: string` — URL prefix prepended to every operation path
- `config.entities: Record<string, EntityDefinition>` — operations-based entities
- `config.operations?: Record<string, OperationDefinition>` — standalone (non-entity) RPC operations
- `config.queryBuilder?: QueryBuilder` — list-param serializer (omit and filters/sort/pagination are NOT added to the URL)
- `options.fetchFn?: FetchFn` — custom fetch (default `defaultFetch`)

### EntityDefinition

```ts
interface EntityDefinition<TSchema, TOperations> {
  schema: TSchema;                         // Zod schema — full entity shape
  identity?: string[];                     // identity field(s) for cache keys; default ["id"]
  operations: TOperations;                 // Record<string, EntityOperationDef> — REQUIRED
  parent?: EntityParent;                   // nested URL: { param, path }
  queries?: Record<string, EntityQuery>;   // named query scopes by parent relation
  filterSchema?: z.ZodType;                // list filter validation
}
```

There is no `path`, `createSchema`, or `updateSchema` on the entity — per-CRUD paths and DTO schemas live inside each `operations` entry.

### EntityOperationDef

```ts
interface EntityOperationDef<TInput, TOutput> {
  method: HttpMethod;          // "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string;                // with :paramName placeholders
  role?: CrudRole;             // inferred from the operation name when omitted
  input?: TInput;              // Zod request schema (optional for GET/DELETE)
  output?: TOutput;            // Zod response schema (falls back to entity schema)
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (queryKeys, params) => readonly unknown[][];
  transformRequest?: (input, url) => TransformedRequest;
  transformResponse?: (raw) => unknown;
}
```

`CrudRole` is `"list" | "get" | "getForEdit" | "create" | "update" | "delete" | "order" | "tree" | "subtree" | "multiUpdate" | "batchUpdate" | "batchDelete" | "search"`. `CRUD_OPERATIONS` is an exported preset of method defaults — `list`/`get` → GET, `create` → POST, `update` → PATCH, `delete` → DELETE — spread it to avoid repeating `method`:

```ts
import { CRUD_OPERATIONS } from "@simplix-react/contract";
operations: {
  create: { ...CRUD_OPERATIONS.create, path: "/products", input: createProductSchema },
}
```

### OperationDefinition (standalone, top-level)

For RPC-style endpoints that don't belong to an entity. `input` and `output` are required here.

```ts
interface OperationDefinition<TInput, TOutput> {
  method: HttpMethod;
  path: string;                // :paramName params map positionally to client args
  input: TInput;               // Zod request schema (required)
  output: TOutput;             // Zod response schema (required)
  contentType?: "json" | "multipart";
  responseType?: "json" | "blob";
  invalidates?: (queryKeys, params) => readonly unknown[][];
  transformRequest?: (input, url) => TransformedRequest;
  transformResponse?: (raw) => unknown;
}
```

### customizeApi(base, patch, options?)

The supported way to adapt an OpenAPI-generated contract without editing generated files. Adds, replaces, or removes entity operations and returns a re-derived contract (`{ config, client, queryKeys }`).

```ts
import { customizeApi } from "@simplix-react/contract";

export const petApi = customizeApi(generatedPetApi, {
  entities: {
    pet: {
      operations: {
        list: { method: "GET", path: "/pet/findByStatus", role: "list" }, // replace
        findByTags: null,                                                  // remove
      },
    },
  },
});
```

`ApiPatch` is `{ entities?: Record<string, EntityPatch> }`; `EntityPatch` is `{ operations?: Record<string, EntityOperationDef | null> }` where `null` removes an operation and an object adds or replaces it.

## Deriving hooks — deriveEntityHooks(contract)

Generates per-entity hooks and a `useMutation` per standalone operation. Returns `DerivedEntityHooksResult`.

```ts
import { deriveEntityHooks } from "@simplix-react/react";
export const hooks = deriveEntityHooks(shopApi);
```

Entity hooks (one set per entity, by operation role):

```ts
hooks.product.useList(parentId?, params?, options?);        // overloaded — see api-patterns.md
hooks.product.useGet(id, options?);                         // id: EntityId
hooks.product.useCreate(parentId?, options?);
hooks.product.useUpdate(options?);                          // { id: EntityId; dto } variable; { optimistic? }
hooks.product.useDelete(options?);                          // EntityId variable
hooks.product.useInfiniteList(parentId?, params?, options?);
hooks.product.useTree(params?, options?);                   // only for a "tree"-role operation
```

`EntityId` is `string | Record<string, string>` (composite keys). A `tree`-role operation derives `useTree`; any custom (non-CRUD) operation on the entity derives a `use<OperationName>` hook (GET → query, otherwise mutation). Standalone operations expose `hooks.<operation>.useMutation(options?)`, which auto-invalidates the keys returned by the operation's `invalidates`.

> **Type note.** Derived hooks and the client are fully typed from the contract — `hooks.product.useList()` is `UseQueryResult<Product[]>`, `useCreate()` is `UseMutationResult<Product, Error, CreateInput>`, and `shopApi.client.product.get(id)` is `Promise<Product>`. No casts needed. To keep that inference, define operations **inline** in `defineApi` — extracting one into a `const … satisfies OperationDefinition` widens its generics and de-types the derived hook. See [API Patterns → Type inference](./references/api-patterns.md#simplix-reactreact).

## Deriving forms — deriveEntityFormHooks(contract, hooks)

Derives TanStack Form hooks from the same contract. Takes the contract AND the React Query hooks. Each entity gets `useCreateForm` / `useUpdateForm` based on whether it has `create` / `update` operations.

```ts
import { deriveEntityFormHooks } from "@simplix-react/form";
export const formHooks = deriveEntityFormHooks(shopApi, hooks);

// useCreateForm(parentId?, options?) → { form, isSubmitting, submitError, reset }
// useUpdateForm(entityId, options?)  → { form, isLoading, isSubmitting, submitError, entity }
const { form, isSubmitting } = formHooks.product.useCreateForm();
```

`form` is a TanStack Form `AnyFormApi` (`form.Field`, `form.handleSubmit()`). `useCreateForm` resets on success by default; `useUpdateForm` sends only dirty fields by default (`dirtyOnly`). Server-side validation errors map back to fields via `mapServerErrorsToForm`. See [API Patterns](./references/api-patterns.md) and [Recipes](./references/recipes.md).

## Mock layer

```ts
import { setupMockWorker, deriveMockHandlers } from "@simplix-react/mock";

const handlers = deriveMockHandlers(shopApi.config, { product: { defaultLimit: 20 } });
await setupMockWorker({
  domains: [{ name: "shop", handlers, seed: { shop_products: [{ id: 1, name: "Widget" }] } }],
});
```

`deriveMockHandlers(config, mockConfig?, options?)` generates MSW handlers backed by in-memory stores: list (filter/sort/offset-paginate), get-by-id, create (numeric auto-increment `id` via `getNextId` when absent), `PATCH` update (stamps `updatedAt`), delete. Stores are named `{domain}_{snake_case_entity}` (e.g. `shop_products`). The third `options?: MockHandlerOptions` customizes the response envelope. See [API Patterns](./references/api-patterns.md).

## i18n

```ts
import { createI18nConfig } from "@simplix-react/i18n";
const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations: import.meta.glob("./locales/**/*.json", { eager: true }),
});
```

React bindings live at `@simplix-react/i18n/react` (`I18nProvider`, `useTranslation`, `useI18n`, `useLocale`). See [Recipes](./references/recipes.md).

## Testing

```ts
import { createTestQueryClient, createTestWrapper, createMockClient, waitForQuery } from "@simplix-react/testing";
```

For access-controlled UI, the same package exports `createMockPolicy` and `createAccessTestWrapper`. See [Recipes](./references/recipes.md).

## Project configuration

`simplix.config.ts` at the project root drives the CLI and code generation:

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"], // CLI extension plugins (spec profiles, adapters)
  api: { baseUrl: "/api" },                                // basePath = api.baseUrl + "/" + domain
  http: { environments: { development: { baseUrl: "http://localhost:3000" } } },
  i18n: { locales: ["en", "ko"], defaultLocale: "ko" },
  openapi: [                                               // ARRAY of per-spec configs
    {
      spec: "openapi.json",
      profile: "simplix-boot",
      domains: { shop: ["product", "order"] },             // domain → tag patterns
    },
  ],
});
```

`openapi` is an array of per-spec configs (`{ spec, profile?, naming?, responseAdapter?, domains, crud? }`), NOT a single `{ domains }` object. Full option reference: [Configuration](./references/configuration.md).

## Terminology

| Use | Do NOT use |
| --- | --- |
| entity | model, resource |
| operation | action, endpoint, rpc |
| derive | generate, auto-create |
| contract | schema, spec, definition |
| mock handler | mock server, stub |
| module (FSD) | feature folder |

## Code conventions

- File naming: kebab-case (`api-client.ts`, `use-query.ts`)
- One contract per domain (`shop-api`, `billing-api`); derive hooks once and export from a single file
- Reusable derivation lives in `packages/`; feature code lives in FSD `modules/`
- `defaultFetch` unwraps the `{ data: T }` envelope and throws `ApiError` on non-2xx

## Related packages

- `@simplix-react/auth` — request-layer auth (Bearer / API Key / OAuth2 / custom schemes, token stores, auto-refresh) wired through `options.fetchFn`. See its package README.
- `@simplix-react/access` — CASL-based authorization (`createAccessPolicy`, `useCan`, `Can`, `requireAccess`). See its package README.

## When to use this skill

- Authoring or editing contracts with `defineApi` / `customizeApi`
- Adding entities or operations to a contract
- Deriving hooks (`deriveEntityHooks`) or forms (`deriveEntityFormHooks`)
- Setting up the MSW mock layer
- Configuring `simplix.config.ts`
- Running the `simplix` CLI to scaffold projects, domains, modules, or CRUD UI
- Debugging type errors in the derivation pipeline
- Setting up i18n or writing tests with `@simplix-react/testing`

## References

- [CLI & Scaffolding Workflow](./references/cli-workflow.md) — `simplix` commands and step-by-step domain/module scaffolding
- [API Patterns](./references/api-patterns.md) — full signatures and type details for every package
- [Recipes](./references/recipes.md) — complete, copy-ready code examples
- [Configuration](./references/configuration.md) — `simplix.config.ts` option reference
- [React Native](./references/react-native.md) — `simplix-react-native` invariants, mobile screen grammar, standard-kit registry, `add-app --native` / `scaffold --native`
