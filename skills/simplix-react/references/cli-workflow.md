# CLI & Scaffolding Workflow

The `simplix` CLI is the front door to the framework. New projects, domain packages, feature modules, and CRUD UI are **generated**, not hand-written — generation keeps everything aligned with the structure the validators and the derivation pipeline expect. When an OpenAPI spec exists, treat generation as the source of truth and refine with `customizeApi`, never by editing generated files.

## Command reference

| Command | Purpose |
| --- | --- |
| `simplix init <name>` | Scaffold a new monorepo (`packages/`, `modules/`, `apps/`, `simplix.config.ts`) |
| `simplix openapi <spec>` | Generate domain code from an OpenAPI spec via Orval (file path or URL) |
| `simplix add-domain <name>` | Add a domain package **skeleton** to fill in by hand |
| `simplix add-module <name>` | Add a new FSD feature module |
| `simplix scaffold <entity>` | Generate CRUD widgets into a module's `widgets/` layer |
| `simplix init-ui` | Initialize `@simplix-react/ui` with shadcn/ui integration |
| `simplix validate` | Validate project structure, FSD layer rules, imports, and i18n |
| `simplix i18n-codegen` | Generate TypeScript types from i18n JSON files |

The command is `simplix scaffold` (not `scaffold-crud`).

### simplix init `<project-name>`

Creates a new simplix-react monorepo and its `simplix.config.ts`.

| Option | Effect |
| --- | --- |
| `-s, --scope <scope>` | npm scope for generated packages |
| `--no-demo` | Skip the demo app |
| `--no-i18n` | Skip i18n setup |
| `--no-auth` | Skip auth setup |
| `--no-access` | Skip access-control setup |
| `-y, --yes` | Accept all defaults (non-interactive) |

### simplix openapi `<spec>`

Generates domain packages from an OpenAPI spec (file path or URL) using Orval. Reads `openapi[]`, `api.baseUrl`, and `plugins` from `simplix.config.ts`. If a spec entry declares a `profile` whose plugin is not loaded, the command warns and exits rather than generating incorrect code.

| Option | Effect |
| --- | --- |
| `-d, --domain <name>` | Generate a single domain (default: all configured domains) |
| `-e, --entities <names>` | Comma-separated entity names (default: all) |
| `-o, --output <dir>` | Output directory (default: `packages/`) |
| `-f, --force` | Regenerate even when no changes are detected |
| `--no-http` | Skip `.http` file generation |
| `-y, --yes` | Auto-confirm without prompts |

### simplix add-domain `<name>`

Adds a domain package **skeleton only** — you then author the contract's `operations` by hand. Reads `api.baseUrl` (for `basePath`) and `openapi` (to detect a matching spec).

| Option | Effect |
| --- | --- |
| `--no-i18n` | Skip i18n translations setup |
| `-y, --yes` | Accept all defaults |

### simplix add-module `<name>`

Adds a new FSD feature module with `features/`, `widgets/`, `shared/{lib,ui,config}`, `manifest.ts`, and (optionally) `locales/`. Reads `i18n.locales` and `packages.prefix`.

| Option | Effect |
| --- | --- |
| `--no-i18n` | Skip i18n locales setup |
| `-y, --yes` | Accept all defaults |

### simplix scaffold `<entity>`

Generates CRUD widgets (list / form / detail) into a module's `widgets/<entity>/` layer. Reads `i18n.locales`.

| Option | Effect |
| --- | --- |
| `--module <dir>` | Target FSD module directory (relative to `modules/`) |
| `--output <dir>` | Explicit output directory (overrides `--module`, relative to cwd) |

With neither option, it auto-detects the module when exactly one exists; otherwise pass `--module`.

### simplix validate

Validates project structure, FSD layer rules (`features/` ↛ `widgets/`, `shared/` ↛ `features/`/`widgets/`, modules require `manifest.ts`), import boundaries, and i18n. `--fix` auto-fixes where possible. Does not read `simplix.config.ts`.

### simplix init-ui / simplix i18n-codegen

- `simplix init-ui` (`-y, --yes`) wires `@simplix-react/ui` with shadcn/ui.
- `simplix i18n-codegen` (`--watch`) generates TypeScript types from i18n JSON files.

## Workflow: new project

```bash
simplix init my-app -y
cd my-app
pnpm install
```

This produces `packages/`, `modules/`, `apps/`, and a `simplix.config.ts` preconfigured with a CLI plugin, `api.baseUrl`, and an HTTP environment.

## Workflow: add a domain from an OpenAPI spec (preferred)

1. Add a spec entry to `simplix.config.ts` `openapi[]` with the spec path, a `profile`, and the `domains` tag mapping (see [Configuration](./configuration.md)).
2. Generate:

   ```bash
   simplix openapi openapi.json -y
   pnpm install
   ```

   This emits `packages/<prefix>-domain-<name>/` containing the contract (`defineApi` with an `operations` map), Zod schemas, derived hooks, and mock handlers.
3. Refine without editing generated files — wrap the generated contract with `customizeApi` to add, replace, or remove operations.

If the spec is Swagger 2.0, convert first: `npx -y swagger2openapi spec.json -o spec-v3.json`.

## Workflow: add a domain by hand (no spec)

```bash
simplix add-domain inventory -y
```

Then author the contract's entities. Each entity is `schema` + an `operations` map (`list` / `get` / `create` / `update` / `delete`, each with `method` + `path`; `create` / `update` with `input`). See [Authoring a contract](../SKILL.md) and [Recipes](./recipes.md).

## Workflow: add a feature module and its CRUD UI

```bash
simplix add-module catalog -y          # creates modules/catalog with FSD layers
simplix scaffold product --module catalog
```

`scaffold` writes CRUD widgets into `modules/catalog/src/widgets/product/`, consuming the derived hooks from the domain package. Keep domain derivation in `packages/` and feature/UI code in `modules/` — `simplix validate` enforces the boundary.

## Workflow: verify

```bash
simplix validate          # structure, FSD rules, imports, i18n
pnpm typecheck && pnpm build
```
