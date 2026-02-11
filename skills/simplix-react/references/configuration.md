# Configuration Reference

`simplix.config.ts` is the central configuration file for simplix-react projects. It is loaded at project root by the CLI and controls code generation, mock layer, HTTP environments, and OpenAPI integration.

## File Location

```
project-root/
  simplix.config.ts    <-- here
  packages/
  apps/
  ...
```

## Full Configuration

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
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

  // ── Mock ───────────────────────────────────────────────────
  mock: {
    /** Default page size for mock list queries */
    defaultLimit: 50,
    /** Maximum allowed page size */
    maxLimit: 100,
    /** PGlite IndexedDB storage path */
    dataDir: "idb://my-project-mock",
  },

  // ── Code Generation ────────────────────────────────────────
  codegen: {
    /** Prepend auto-generated header comment to generated files */
    header: true,
  },

  // ── OpenAPI ────────────────────────────────────────────────
  openapi: {
    /** Tag-based domain splitting: domainName -> tagPatterns (exact string or /regex/) */
    domains: {
      pet: ["pet", "category", "tag"],
      store: ["store", "order", "inventory"],
      user: ["user", "/^auth.*/"],
    },
  },
});
```

## Option Details

### api

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string` | `"/api"` | API base path prepended to all domain paths in generated code |

Used by `add-domain` and `openapi` commands to compute `basePath` for `defineApi()`:

```
basePath = api.baseUrl + "/" + domainName
// e.g., "/api/pet", "/api/store"
```

### packages

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `prefix` | `string` | derived from `package.json` name | Short prefix for generated package names |

When omitted, the CLI derives the prefix from the root `package.json` name by stripping the scope.

Example: `@mycompany/petstore-monorepo` -> prefix = `petstore`

Generated packages follow the pattern: `{scope}/{prefix}-domain-{name}`

### http

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `environments` | `Record<string, { baseUrl: string }>` | `{ development: { baseUrl: "http://localhost:3000" } }` | Named environments for `.http` file generation |

Each environment defines a `baseUrl` used in generated `.http` test files.

### mock

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultLimit` | `number` | `50` | Default page size for mock list endpoints |
| `maxLimit` | `number` | `100` | Maximum allowed page size (clamped) |
| `dataDir` | `string` | `"idb://simplix-mock"` | PGlite IndexedDB storage path |

The `dataDir` determines where PGlite stores its data in the browser's IndexedDB. Use a project-specific name to avoid collisions between projects:

```ts
mock: {
  dataDir: "idb://my-project-mock",
}
```

For testing, use `memory://test` to avoid persistence:

```ts
const db = await initPGlite("memory://test");
```

### codegen

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `header` | `boolean` | `true` | Prepend auto-generated header comment to generated files |

When `true`, generated files include a header like:

```ts
// This file is auto-generated. Do not edit manually.
```

### openapi

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `domains` | `Record<string, string[]>` | `undefined` | Tag-based domain splitting for OpenAPI code generation |

Maps domain names to OpenAPI tag patterns. Each pattern can be:

- **Exact string**: `"pet"` matches the tag `pet`
- **Regex**: `"/^auth.*/"` matches tags starting with `auth`

Example:

```ts
openapi: {
  domains: {
    pet: ["pet", "category"],
    user: ["user", "/^auth.*/"],
  },
}
```

When running `simplix openapi`, operations are grouped into domain packages based on their OpenAPI tags matching these patterns.

## Config Loading Behavior

1. The CLI looks for `simplix.config.ts` at the project root
2. If found, it is loaded via `jiti` (TypeScript-aware dynamic import)
3. If not found or loading fails (e.g., dependencies not yet installed), defaults are used
4. Config values are shallow-merged with defaults

## defineConfig Helper

`defineConfig()` is a type-safe identity function that provides autocompletion:

```ts
import { defineConfig } from "@simplix-react/cli";

export default defineConfig({
  // Full TypeScript IntelliSense here
});
```

It simply returns the config object as-is. Its only purpose is TypeScript type inference.

## CLI Commands That Use Config

| Command | Config Fields Used |
| --- | --- |
| `simplix init` | Generates the config file |
| `simplix add-domain` | `api.baseUrl` for basePath computation |
| `simplix openapi` | `api.baseUrl`, `openapi.domains`, `codegen.header` |
| `simplix validate` | Validates against config constraints |

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

### OpenAPI with multiple domains

```ts
export default defineConfig({
  api: { baseUrl: "/api" },
  openapi: {
    domains: {
      pet: ["pet", "category", "tag"],
      store: ["store", "order", "inventory"],
      user: ["user", "address", "/^auth.*/"],
    },
  },
});
```

### Reduced mock limits for development

```ts
export default defineConfig({
  mock: {
    defaultLimit: 10,
    maxLimit: 50,
    dataDir: "idb://my-project-dev",
  },
});
```
