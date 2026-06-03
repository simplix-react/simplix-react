# Configuration Reference

`simplix.config.ts` is the central configuration file for simplix-react projects. It is loaded at the project root by the CLI and controls CLI plugins, code generation, HTTP environments, i18n defaults, and OpenAPI integration.

## File Location

```
project-root/
  simplix.config.ts    <-- here
  packages/
  modules/
  apps/
```

## Full Configuration

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  // ── Plugins ────────────────────────────────────────────────
  // CLI extension plugins loaded before any command runs. They register the
  // spec profiles and response adapters used during code generation.
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],

  // ── API ────────────────────────────────────────────────────
  api: {
    /** API base path — used for basePath in code generation */
    baseUrl: "/api",
  },

  // ── Packages ───────────────────────────────────────────────
  packages: {
    /** Short prefix for generated package names (default: derived from root package.json name) */
    prefix: "my-project",
  },

  // ── HTTP Environments ──────────────────────────────────────
  http: {
    /** .http file environment settings */
    environments: {
      development: { baseUrl: "http://localhost:3000" },
      staging: { baseUrl: "https://staging.example.com" },
      production: { baseUrl: "https://api.example.com" },
    },
  },

  // ── i18n ───────────────────────────────────────────────────
  i18n: {
    /** Supported locale codes (default: ["en", "ko", "ja"]) */
    locales: ["en", "ko", "ja"],
    /** Default locale code (default: "en") */
    defaultLocale: "en",
  },

  // ── Code Generation ────────────────────────────────────────
  codegen: {
    /** Reserved — emitted by `init` but not yet consumed by any command */
    header: true,
  },

  // ── OpenAPI (ARRAY of per-spec configs) ────────────────────
  openapi: [
    {
      spec: "openapi.json",          // file path (relative to root) or URL
      profile: "simplix-boot",       // spec profile preset (from a plugin)
      domains: {                     // domainName → tag patterns (exact string or /regex/)
        project: ["Projects", "Tasks"],
        user: ["Users", "/^Auth.*/"],
      },
    },
  ],
});
```

## Option Details

### plugins

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `plugins` | `string[]` | `[]` | CLI extension plugin module specifiers, loaded at startup |

Each entry (e.g. `"@simplix-react-ext/simplix-boot-cli-plugin"`) registers the spec profiles and response adapters that backend-specific code generation needs. The core CLI is backend-agnostic. If an `openapi[].profile` is referenced but its plugin is not listed (or cannot be resolved), the `openapi` command warns and exits rather than generating incorrect code.

### api

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | `"/api"` | API base path prepended to generated domain paths |

Used by `add-domain` and `openapi` to compute `basePath` for `defineApi()`:

```
basePath = api.baseUrl + "/" + domainName   // e.g. "/api/project"
```

### packages

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `prefix` | `string` | derived from `package.json` name | Short prefix for generated package names |

When omitted, the CLI derives the prefix from the root `package.json` name by stripping the scope (e.g. `@acme/petstore-monorepo` → `petstore`). Generated packages follow `{scope}/{prefix}-domain-{name}`.

### http

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `environments` | `Record<string, { baseUrl: string }>` | `{ development: { baseUrl: "http://localhost:3000" } }` | Named environments for `.http` file generation |

### i18n

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `locales` | `string[]` | `["en", "ko", "ja"]` | Supported locale codes |
| `defaultLocale` | `string` | `"en"` | Default locale code |

Consumed by `add-module` and `scaffold` to seed per-module locale files.

### codegen

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | `boolean` | `true` | Reserved — emitted by `init` but not currently read by any command |

`codegen.header` exists on the type and is written by `init`, but no command consumes it yet. Do not rely on it to control generated file headers.

### queryBuilder

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `queryBuilder` | `unknown` | `undefined` | Global `QueryBuilder` intended to apply to all domains |

A reserved top-level field. Per-contract query building is normally set via `defineApi`'s `queryBuilder` (`simpleQueryBuilder`).

### openapi

`openapi` is an **array** of per-spec configurations (`OpenAPISpecConfig[]`), not a single object. Each entry describes one OpenAPI document and how to split it into domains.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `spec` | `string` | yes | OpenAPI spec file path (relative to root) or URL |
| `profile` | `string` | no | Spec profile preset name (bundles naming + response adapter, from a plugin) |
| `naming` | `OpenApiNamingStrategy` | no | Naming overrides (takes precedence over the profile) |
| `responseAdapter` | `ResponseAdapterConfig` | no | Response-shape adapter (takes precedence over the profile) |
| `domains` | `Record<string, string[]>` | yes | Domain name → tag patterns (exact string or `/regex/`) |
| `crud` | `Partial<Record<CrudRole, CrudEndpointPattern>>` | no | CRUD-role detection patterns; when omitted, no roles are assigned |

Tag patterns match each operation's OpenAPI tags:

- **Exact string**: `"pet"` matches the tag `pet`
- **Regex**: `"/^auth.*/"` matches tags starting with `auth`

When running `simplix openapi`, operations are grouped into domain packages based on their tags matching these patterns.

## Config Loading Behavior

1. The CLI looks for `simplix.config.ts` at the project root.
2. If found, it is loaded via `jiti` (TypeScript-aware dynamic import).
3. If missing, or loading fails (e.g. dependencies not yet installed), defaults are used.
4. Config values are **shallow-merged** with defaults — a user-provided nested object (e.g. `http`) replaces the default nested object wholesale rather than deep-merging.

## defineConfig Helper

`defineConfig()` is a type-safe identity function that provides autocompletion. It returns the config object unchanged; its only purpose is TypeScript inference.

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  // Full TypeScript IntelliSense here
});
```

## defineCrudMap Helper

For advanced OpenAPI setups, `@simplix-react/cli` also exports `defineCrudMap` — an identity wrapper for a `crud.config.ts` that maps each entity name to a CRUD-role → `operationId` map (`CrudMap` / `CrudEntityConfig`). Use it the same way as `defineConfig` to get autocompletion when pinning generated CRUD roles to specific operation IDs.

## CLI Commands That Read Config

| Command | Config fields used |
| --- | --- |
| `simplix init` | Generates the config file |
| `simplix openapi` | `plugins`, `openapi[]`, `api.baseUrl` |
| `simplix add-domain` | `api.baseUrl`, `openapi` (to detect a matching spec) |
| `simplix add-module` | `i18n.locales`, `packages.prefix` |
| `simplix scaffold` | `i18n.locales` |
| `simplix validate` | none — structure/FSD/imports/i18n checks only |

## Common Patterns

### Multi-environment API setup

```ts
export default defineConfig({
  api: { baseUrl: "/api/v1" },
  http: {
    environments: {
      development: { baseUrl: "http://localhost:3000" },
      staging: { baseUrl: "https://staging-api.myapp.com" },
      production: { baseUrl: "https://api.myapp.com" },
    },
  },
});
```

### OpenAPI with multiple specs and domains

```ts
export default defineConfig({
  plugins: ["@simplix-react-ext/simplix-boot-cli-plugin"],
  api: { baseUrl: "/api" },
  openapi: [
    {
      spec: "core-api.json",
      profile: "simplix-boot",
      domains: {
        store: ["store", "order", "inventory"],
        user: ["user", "address", "/^auth.*/"],
      },
    },
    {
      spec: "https://billing.example.com/openapi.json",
      profile: "simplix-boot",
      domains: { billing: ["invoice", "payment"] },
    },
  ],
});
```
