# How to Use the simplix CLI

> Scaffold projects, add domains and modules, validate structure, generate i18n types, manage migrations, and import OpenAPI specs using the `simplix` command-line tool.

## Before You Begin

- Node.js 18+ and pnpm installed
- Install the CLI globally or use it via `npx`:

```bash
pnpm add -g @simplix-react/cli

# or use without installing
npx @simplix-react/cli <command>
```

## Solution

### simplix init -- Create a New Project

Scaffolds a complete monorepo with root configuration, a core package, and an optional demo app:

```bash
simplix init my-project
```

Interactive prompts ask for:

| Prompt | Default | Description |
| --- | --- | --- |
| npm scope | `@my-project` | Package scope (e.g., `@mycompany`) |
| Include demo app? | `true` | Creates `apps/my-project-demo/` |
| Enable i18n? | `true` | Sets up locale files and i18n config |
| Select locales | en, ko, ja | Multi-select from built-in locales |

Non-interactive mode accepts all defaults:

```bash
simplix init my-project -y
```

Override the scope:

```bash
simplix init my-project --scope @mycompany
```

Skip optional features:

```bash
simplix init my-project --no-demo --no-i18n
```

Generated structure:

```
my-project/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json
  .gitignore
  .claude/CLAUDE.md
  config/typescript/
    base.json
    react.json
  packages/my-project-core/
    src/
      index.ts
      api/
      mock/
      react/
      types/
  apps/my-project-demo/          # if --demo
    src/
      main.tsx
      app/
        i18n/                    # if --i18n
      locales/                   # if --i18n
      routes/
  modules/
```

After scaffolding:

```bash
cd my-project
pnpm install
pnpm build
pnpm dev
```

### simplix add-domain -- Add a Domain Package

Creates a domain package under `packages/` with API client, schemas, hooks, mock handlers, and migrations:

```bash
simplix add-domain inventory
```

Specify entities up front:

```bash
simplix add-domain inventory --entities product,category -y
```

| Option | Description |
| --- | --- |
| `-e, --entities <names>` | Comma-separated entity names |
| `-y, --yes` | Non-interactive mode |

Generated structure:

```
packages/my-project-domain-inventory/
  package.json
  tsup.config.ts
  tsconfig.json
  src/
    index.ts
    api/
      index.ts
      types.ts
      client.ts
      hooks.ts
      query-keys.ts
    schemas/
      index.ts
    interfaces/
      index.ts
    mock/
      index.ts
      handlers.ts
      migrations.ts
      seed.ts
      repositories/
        product.ts
        category.ts
```

After creation:

```bash
pnpm install
pnpm build
```

Then add the dependency to your app:

```json
{
  "dependencies": {
    "@mycompany/my-project-domain-inventory": "workspace:*"
  }
}
```

### simplix add-module -- Add an FSD Module

Creates a Feature-Sliced Design module under `modules/` with features, widgets, shared layers, and optional i18n:

```bash
simplix add-module editor
```

| Option | Description |
| --- | --- |
| `--no-i18n` | Skip locale file generation |
| `-y, --yes` | Non-interactive mode |

Generated structure:

```
modules/my-project-editor/
  package.json
  tsup.config.ts
  tsconfig.json
  src/
    index.ts
    manifest.ts
    features/
      index.ts
    widgets/
      index.ts
    shared/
      lib/
      ui/
      config/
    locales/           # if i18n enabled
      index.ts
      en.json
      ko.json
      ja.json
      widgets/
      features/
```

### simplix validate -- Validate Project Structure

Runs 5 validation rule sets across all packages and modules:

```bash
simplix validate
```

| Rule Set | Scope | What It Checks |
| --- | --- | --- |
| Package Rules | packages/, modules/ | `package.json` fields, required files, build config |
| Contract Rules | packages/ | API contract schema validity, entity definitions |
| FSD Rules | modules/ | Feature-Sliced Design layer structure and conventions |
| Import Rules | modules/ | Cross-layer import violations, circular dependencies |
| i18n Rules | modules/ | Missing locale keys, locale file consistency |

Auto-fix supported issues:

```bash
simplix validate --fix
```

Example output:

```
simplix validate

  packages/my-project-core
    ✔ package.json has required fields
    ✔ tsconfig.json exists
    ✔ Build config valid

  modules/my-project-editor
    ✔ FSD layers present
    ⚠ Missing locale key: "save_button" in ko.json
    ✖ Import violation: widgets/ imports from features/

  Summary: 1 error, 1 warning, 4 checks passed
```

Exit code is `1` when errors are present, making it suitable for CI pipelines:

```bash
simplix validate || exit 1
```

### simplix i18n-codegen -- Generate TypeScript Types from Locale Files

Scans all modules under `modules/` for locale JSON files and generates `keys.d.ts` type definitions:

```bash
simplix i18n-codegen
```

For a module with `src/locales/en.json`:

```json
{
  "title": "Editor",
  "actions": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

The command generates `src/locales/keys.d.ts`:

```ts
// Auto-generated by simplix i18n-codegen
// Do not edit manually

export type LocalesKeys =
  | "title"
  | "actions.save"
  | "actions.cancel";
```

Watch mode regenerates on file changes:

```bash
simplix i18n-codegen --watch
```

### simplix migration create -- Create a Migration File

Generates a timestamped migration file for a domain package's PGlite mock database:

```bash
simplix migration create add-status-column --domain inventory
```

Creates a file like `20260211143022-add-status-column.ts`:

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

| Option | Description |
| --- | --- |
| `--domain <name>` | Required. Target domain package name |

### simplix openapi -- Generate Domain from OpenAPI Spec

Parses an OpenAPI specification and generates a complete domain package with schemas, client, hooks, mock layer, and `.http` test files:

```bash
simplix openapi ./specs/petstore.yaml
```

```bash
simplix openapi https://api.example.com/openapi.json --domain pets
```

| Option | Description |
| --- | --- |
| `-d, --domain <name>` | Domain name (defaults to spec's `info.title`) |
| `-e, --entities <names>` | Filter to specific entities (comma-separated) |
| `-o, --output <dir>` | Output directory (defaults to `packages/`) |
| `--dry-run` | Preview files without writing |
| `-f, --force` | Regenerate even if no changes detected |
| `--no-http` | Skip `.http` file generation |
| `--no-mock` | Skip mock layer generation |
| `--no-header` | Skip auto-generated header comments |
| `-y, --yes` | Auto-confirm without prompts |

On subsequent runs, the command detects changes against a `.openapi-snapshot.json` file and only regenerates the `src/generated/` directory. User-owned files (`src/index.ts`, `src/mock/index.ts`, `package.json`) are preserved.

Preview changes before regenerating:

```bash
simplix openapi ./specs/petstore.yaml --dry-run
```

#### Multi-Domain Mode

When your OpenAPI spec contains operations tagged for different domains, you can split the output into multiple packages automatically. Add `openapi.domains` to your `simplix.config.ts`:

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

Each key is a domain name and each value is an array of tag patterns. Patterns can be exact strings or regular expressions wrapped in `/`:

```ts
// Exact match + regex patterns
domains: {
  iam: ["IAM", "Authentication", "/^Auth.*/"],
  billing: ["Billing", "/^Payment.*/"],
}
```

Running `simplix openapi` with this config generates one package per matched domain:

```bash
simplix openapi https://petstore.swagger.io/v2/swagger.json -y
# → packages/myapp-domain-pet/
# → packages/myapp-domain-store/
# → packages/myapp-domain-user/
```

Entities that do not match any configured tag are placed in a fallback domain (set via `--domain` flag, or derived from the spec title). Domains with zero matching entities are skipped.

## Variations

### Configuration File

Create `simplix.config.ts` at the project root to customize CLI behavior:

```ts
// simplix.config.ts
import type { SimplixConfig } from "@simplix-react/cli";

const config: SimplixConfig = {
  packages: {
    prefix: "myapp",
  },
  http: {
    environments: {
      dev: { baseUrl: "http://localhost:3000" },
      staging: { baseUrl: "https://staging.example.com" },
      production: { baseUrl: "https://api.example.com" },
    },
  },
  mock: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  codegen: {
    header: true,
  },
  openapi: {
    domains: {
      iam: ["IAM", "/^Auth.*/"],
      billing: ["Billing"],
    },
  },
};

export default config;
```

| Field | Description |
| --- | --- |
| `packages.prefix` | Short prefix for generated package names |
| `http.environments` | Named environments for `.http` file generation |
| `mock.defaultLimit` | Default pagination limit for mock handlers |
| `mock.maxLimit` | Maximum allowed pagination limit |
| `codegen.header` | Prepend auto-generated header comment to generated files |
| `openapi.domains` | Tag-based domain splitting: domain name → tag patterns (exact or `/regex/`) |

### CI Integration

Run validation and type checking in your CI pipeline:

```bash
#!/bin/bash
set -e

pnpm install
pnpm build
simplix validate
pnpm typecheck
pnpm lint
pnpm test
```

### Combining Commands for a New Domain Workflow

A typical workflow when adding a new API domain:

```bash
# 1. Generate from OpenAPI spec
simplix openapi ./specs/inventory.yaml --domain inventory -y

# 2. Install dependencies
pnpm install

# 3. Build the new package
pnpm build

# 4. Validate the project
simplix validate

# 5. Generate i18n types if the domain has locale files
simplix i18n-codegen
```

## Related

- [Internationalization](./internationalization.md) -- i18n setup that `simplix init` scaffolds
- [Testing with Mocks](./testing-with-mocks.md) -- Testing against mock handlers from `add-domain`
- [@simplix-react/cli source](../../packages/cli/src/)
