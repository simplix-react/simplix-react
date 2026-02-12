[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/cli

<p align="center">
  <img src="../../_media/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/cli

CLI for scaffolding and validating simplix-react projects.

## Installation

Install via the meta package (recommended):

```bash
pnpm add simplix-react
```

When using pnpm, add this to `.npmrc` so `@simplix-react/*` packages are resolvable:

```ini
public-hoist-pattern[]=@simplix-react/*
```

Or install the CLI only:

```bash
pnpm add -D @simplix-react/cli
```

Requires **Node.js 18 or later**.

> **Note:** Projects scaffolded with `simplix init` include the `.npmrc` configuration automatically.

## Quick Start

```bash
# Create a new project
simplix init my-app

# Add a domain package
simplix add-domain inventory

# Add an FSD module
simplix add-module editor

# Validate project structure
simplix validate
```

## Commands

### simplix init

Initialize a new simplix-react project with a monorepo structure (pnpm + Turborepo).

```bash
simplix init <project-name> [options]
```

**Arguments:**

| Argument | Description |
| --- | --- |
| `project-name` | Name of the project to create |

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `-s, --scope <scope>` | npm scope for packages | `@<project-name>` |
| `--no-demo` | Skip demo app creation | - |
| `--no-i18n` | Skip i18n setup | - |
| `-y, --yes` | Accept all defaults (non-interactive) | - |

**Example:**

```bash
# Interactive mode
simplix init my-app

# Non-interactive with custom scope
simplix init my-app --scope @mycompany -y

# Without demo app or i18n
simplix init my-app --no-demo --no-i18n -y
```

**Generated structure:**

```
my-app/
  apps/my-app-demo/       # Demo app (if --no-demo not set)
  packages/my-app-core/   # Core package (API, mock, react, types)
  modules/                # FSD modules directory
  config/typescript/       # Shared TypeScript configs
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json
  .gitignore
  .claude/CLAUDE.md
```

When i18n is enabled, the demo app includes locale files for `en`, `ko`, and `ja`.

### simplix add-domain

Add a new domain package under `packages/`. Domain packages encapsulate API client, schemas, mock handlers, and repository logic for a specific domain.

```bash
simplix add-domain <name> [options]
```

**Arguments:**

| Argument | Description |
| --- | --- |
| `name` | Domain name (e.g., `inventory`, `topology`) |

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `-e, --entities <entities>` | Comma-separated entity names | domain name |
| `-y, --yes` | Accept all defaults (non-interactive) | - |

**Example:**

```bash
# Interactive mode
simplix add-domain inventory

# With explicit entities
simplix add-domain inventory --entities product,category,warehouse -y
```

**Generated structure:**

```
packages/<project>-domain-<name>/
  src/
    api/
      client.ts           # API client functions
      hooks.ts            # React Query hooks
      query-keys.ts       # Query key factory
      types.ts            # API types
      index.ts
    schemas/
      index.ts            # Zod schemas
    interfaces/
      index.ts
    mock/
      handlers.ts         # MSW request handlers
      migrations.ts       # PGlite migrations
      seed.ts             # Seed data
      repositories/
        <entity>.ts       # Per-entity repository
      index.ts
    index.ts
  package.json
  tsup.config.ts
  tsconfig.json
```

### simplix add-module

Add a new FSD (Feature-Sliced Design) module under `modules/`. Modules organize UI features using the FSD architecture with `features/`, `widgets/`, and `shared/` layers.

```bash
simplix add-module <name> [options]
```

**Arguments:**

| Argument | Description |
| --- | --- |
| `name` | Module name (e.g., `editor`, `maps`, `monitoring`) |

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `--no-i18n` | Skip i18n locales setup | - |
| `-y, --yes` | Accept all defaults (non-interactive) | - |

**Example:**

```bash
# Interactive mode
simplix add-module editor

# Without i18n
simplix add-module editor --no-i18n -y
```

**Generated structure:**

```
modules/<project>-<name>/
  src/
    features/
      index.ts
    widgets/
      index.ts
    shared/
      lib/
      ui/
      config/
    locales/              # Only if i18n enabled
      en.json
      ko.json
      ja.json
      index.ts
      widgets/
      features/
    manifest.ts
    index.ts
  package.json
  tsup.config.ts
  tsconfig.json
```

### simplix validate

Validate project structure, FSD layer rules, import boundaries, package configuration, i18n consistency, and contract completeness.

```bash
simplix validate [options]
```

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `--fix` | Auto-fix issues where possible | `false` |

**Example:**

```bash
# Validate only
simplix validate

# Validate and auto-fix
simplix validate --fix
```

**Validation rules:**

The validator applies different rule sets to packages and modules:

| Rule Set | Target | Checks |
| --- | --- | --- |
| **Package** | packages/, modules/ | `exports` field, `tsup.config`, React `peerDependencies`, `"type": "module"` |
| **Contract** | packages/ | Entity schemas completeness (`schema`, `createSchema`, `updateSchema`), operation `input`/`output`, mock handler config |
| **FSD** | modules/ | `manifest.ts` exists, `features/` does not import from `widgets/`, `shared/` does not import from `features/` or `widgets/` |
| **Import** | modules/ | No cross-module direct imports (must use package exports) |
| **i18n** | modules/ | Missing keys across locales, extra keys, empty values, interpolation variable (`{{var}}`) consistency |

Auto-fixable issues (with `--fix`):

- Missing `"type": "module"` in `package.json`
- Missing React `peerDependencies`
- Missing i18n keys (copies from reference locale)
- Extra i18n keys (removes from target locale)

**Output format:**

```
simplix validate

  packages/myapp-core
    ✔ Has "exports" field
    ✔ tsup.config exists
    ✔ "type": "module"

  modules/myapp-editor
    ✔ Manifest exists
    ✔ FSD: features/ has no widgets/ imports
    ✖ i18n: Missing key "title" in ko.json (src/locales)

  Summary: 1 error, 0 warnings, 5 checks passed
```

### simplix i18n-codegen

Generate TypeScript type definitions from i18n JSON files. Scans all modules under `modules/` and creates `keys.d.ts` files containing union types of all translation keys.

```bash
simplix i18n-codegen [options]
```

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `--watch` | Watch for file changes and regenerate | `false` |

**Example:**

```bash
# One-time generation
simplix i18n-codegen

# Watch mode
simplix i18n-codegen --watch
```

The codegen uses `en.json` as the source of truth (falls back to the first JSON file found). It generates a union type of all flattened keys:

```ts
// Auto-generated by simplix i18n-codegen
// Do not edit manually

export type LocalesKeys =
  | "title"
  | "description"
  | "actions.save"
  | "actions.cancel";
```

### simplix migration

Database migration management for PGlite mock databases.

#### simplix migration create

Create a new timestamped migration file in a domain package.

```bash
simplix migration create <name> --domain <domain>
```

**Arguments:**

| Argument | Description |
| --- | --- |
| `name` | Migration name (auto-converted to kebab-case) |

**Options:**

| Option | Description | Required |
| --- | --- | --- |
| `--domain <domain>` | Domain package name | Yes |

**Example:**

```bash
simplix migration create addStatusColumn --domain inventory
```

Creates a file like `20260211143022-add-status-column.ts` in the domain's `src/mock/migrations/` directory:

```ts
import type { PGlite } from "@electric-sql/pglite";

export async function up(db: PGlite): Promise<void> {
  await db.query(`
    -- ALTER TABLE ...
  `);
}

export async function down(db: PGlite): Promise<void> {
  await db.query(`
    -- ALTER TABLE ...
  `);
}
```

### simplix openapi

Generate a complete domain package from an OpenAPI specification. Supports both file paths and URLs as input. On subsequent runs, it performs incremental updates by comparing against a snapshot, regenerating only the `src/generated/` directory while preserving user-modified files.

```bash
simplix openapi <spec> [options]
```

**Arguments:**

| Argument | Description |
| --- | --- |
| `spec` | OpenAPI spec file path or URL |

**Options:**

| Option | Description | Default |
| --- | --- | --- |
| `-d, --domain <name>` | Domain name | Derived from OpenAPI `info.title` |
| `-e, --entities <names>` | Entity names to generate (comma-separated) | All entities |
| `-o, --output <dir>` | Output directory | `packages/` |
| `--dry-run` | Preview files without writing | `false` |
| `-f, --force` | Force regeneration even if no changes | `false` |
| `--no-http` | Skip `.http` file generation | - |
| `--no-mock` | Skip mock layer generation | - |
| `--header` | Add auto-generated header comment | `true` |
| `--no-header` | Skip auto-generated header comment | - |
| `-y, --yes` | Auto-confirm without prompts | - |

**Example:**

```bash
# Generate from a local file
simplix openapi ./specs/inventory-api.yaml

# Generate from a URL with custom domain name
simplix openapi https://api.example.com/openapi.json --domain inventory

# Generate specific entities only
simplix openapi ./spec.yaml --entities product,category

# Preview without writing files
simplix openapi ./spec.yaml --dry-run

# Force regeneration, skip mocks
simplix openapi ./spec.yaml --force --no-mock -y
```

**Generated structure (first run):**

```
packages/<prefix>-domain-<name>/
  src/
    generated/              # Auto-generated (regenerated on updates)
      schemas.ts            # Zod schemas from OpenAPI
      client.ts             # API client functions
      hooks.ts              # React Query hooks
      query-keys.ts         # Query key factory
      interfaces.ts         # TypeScript interfaces
      index.ts
    mock/
      generated/            # Auto-generated mock layer
        handlers.ts         # MSW request handlers
        migrations.ts       # PGlite migrations
        repositories/
          <entity>.ts       # Per-entity repository
      seed.ts               # User-editable seed data
      index.ts              # User-editable mock entry
    index.ts                # User-editable package entry
  http/                     # HTTP client files
    http-client.env.json
    <entity>.http
  .openapi-snapshot.json    # Snapshot for incremental updates
  package.json
  tsup.config.ts
  tsconfig.json
  eslint.config.js
```

On subsequent runs, only `src/generated/` and `src/mock/generated/` are regenerated. User-modified files (`src/index.ts`, `src/mock/index.ts`, `src/mock/seed.ts`, `package.json`, etc.) are preserved.

#### Multi-Domain Mode (Tag-Based Splitting)

When your OpenAPI spec covers multiple domains, you can split entities into separate packages based on operation tags. Configure `openapi.domains` in `simplix.config.ts` to map domain names to tag patterns:

```ts
// simplix.config.ts
export default {
  openapi: {
    domains: {
      pet: ["pet"],
      store: ["store"],
      user: ["user"],
    },
  },
} satisfies SimplixConfig;
```

Each value is an array of tag patterns. Patterns can be exact strings or regular expressions enclosed in `/`:

```ts
openapi: {
  domains: {
    iam: ["IAM", "Authentication", "/^Auth.*/"],  // exact + regex
    billing: ["Billing", "/^Payment.*/"],
  },
}
```

When `openapi.domains` is configured, running `simplix openapi` generates one package per domain:

```bash
simplix openapi https://petstore.swagger.io/v2/swagger.json -y

# Generates:
#   packages/myapp-domain-pet/
#   packages/myapp-domain-store/
#   packages/myapp-domain-user/
```

**Matching rules:**

| Rule | Behavior |
| --- | --- |
| First-match-wins | Each entity is assigned to the first matching domain in config order |
| Fallback domain | Entities with no matching tags go to a fallback domain (from `--domain` flag or spec title) |
| Empty domain skip | Domains with zero matched entities are not generated |
| Entity filter first | `--entities` filter is applied before domain grouping |
| Independent snapshots | Each domain package maintains its own `.openapi-snapshot.json` |

When `openapi.domains` is not configured or is an empty object, the command falls back to single-domain behavior.

Dry-run mode shows file lists grouped by domain:

```bash
simplix openapi ./spec.yaml --dry-run

# Multi-domain mode: pet(3), store(2), user(1)
# Dry run — myapp-domain-pet/
#   src/generated/index.ts
#   src/generated/schemas.ts
#   ...
# Dry run — myapp-domain-store/
#   ...
```

## Configuration

The CLI reads an optional `simplix.config.ts` file from the project root. If the file does not exist, default values are used.

```ts
// simplix.config.ts
import type { SimplixConfig } from "@simplix-react/cli";

export default {
  packages: {
    prefix: "myapp",             // Package name prefix (default: derived from root package.json)
  },
  http: {
    environments: {
      development: { baseUrl: "http://localhost:3000" },
      staging: { baseUrl: "https://staging.example.com" },
    },
  },
  mock: {
    defaultLimit: 50,            // Default pagination limit
    maxLimit: 100,               // Maximum pagination limit
  },
  codegen: {
    header: true,                // Add auto-generated header to generated files
  },
  openapi: {
    domains: {                   // Tag-based domain splitting (optional)
      iam: ["IAM", "/^Auth.*/"],
      billing: ["Billing"],
    },
  },
} satisfies SimplixConfig;
```

| Field | Description | Default |
| --- | --- | --- |
| `packages.prefix` | Short prefix for generated package names | Derived from root `package.json` name |
| `http.environments` | Named environments for `.http` files | `{ development: { baseUrl: "http://localhost:3000" } }` |
| `mock.defaultLimit` | Default pagination limit for mock handlers | `50` |
| `mock.maxLimit` | Maximum pagination limit for mock handlers | `100` |
| `codegen.header` | Prepend auto-generated header comment to generated files | `true` |
| `openapi.domains` | Tag-based domain splitting map: domain name → tag patterns (exact or `/regex/`) | `undefined` (single domain) |

The config file is loaded using [jiti](https://github.com/unjs/jiti), so TypeScript syntax is supported without compilation.

## Related Packages

Install all packages at once with the meta package:

```bash
pnpm add simplix-react
```

| Package | Description |
| --- | --- |
| [`simplix-react`](https://www.npmjs.com/package/simplix-react) | Meta package (installs all packages below) |
| `@simplix-react/contract` | Zod-based type-safe API contract definitions |
| `@simplix-react/react` | React Query hooks derived from contracts |
| `@simplix-react/form` | TanStack Form hooks derived from contracts |
| `@simplix-react/auth` | Authentication middleware (Bearer, API Key, OAuth2) |
| `@simplix-react/mock` | MSW handlers + PGlite repositories auto-generation |
| `@simplix-react/i18n` | i18next-based internationalization framework |
| `@simplix-react/testing` | Test utilities (mock clients, query wrappers) |

## Interfaces

- [SimplixConfig](interfaces/SimplixConfig.md)

## Functions

- [defineConfig](functions/defineConfig.md)
